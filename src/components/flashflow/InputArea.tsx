
"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Firebase imports
import { storage, db, auth } from '@/lib/firebase'; // Assuming auth might be used for userId
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc, onSnapshot, serverTimestamp, Unsubscribe } from "firebase/firestore";
import { onAuthStateChanged, type User } from 'firebase/auth';


interface InputAreaProps {
  onTextReady: (text: string) => void;
  isLoading: boolean; // This is for the main flashcard generation loading state
}

type FileProcessingStatus = "idle" | "uploading" | "parsing" | "completed" | "failed";

export function InputArea({ onTextReady, isLoading: isGeneratingFlashcards }: InputAreaProps) {
  const [pastedText, setPastedText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileToProcess, setFileToProcess] = useState<File | null>(null);
  const [processingStatus, setProcessingStatus] = useState<FileProcessingStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firestoreUnsubscribeRef = useRef<Unsubscribe | null>(null);


  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    // Cleanup listener on component unmount
    return () => {
      if (firestoreUnsubscribeRef.current) {
        firestoreUnsubscribeRef.current();
      }
    };
  }, []);

  const resetInputState = () => {
    setPastedText("");
    setFileName(null);
    setFileToProcess(null);
    setProcessingStatus("idle");
    setUploadProgress(0);
    onTextReady("");
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
    if (firestoreUnsubscribeRef.current) {
      firestoreUnsubscribeRef.current(); // Stop listening to previous document
      firestoreUnsubscribeRef.current = null;
    }
  };


  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      // User cancelled file dialog or no file selected
      // Only reset if no file is actively being processed or was just processed.
      if (processingStatus === 'idle' || processingStatus === 'completed' || processingStatus === 'failed') {
         resetInputState();
      }
      return;
    }

    // If a file is already processing, prevent new upload
    if (processingStatus === 'uploading' || processingStatus === 'parsing') {
        toast({
            title: "Processing in Progress",
            description: "Please wait for the current file to finish processing.",
            variant: "default",
        });
        if (fileInputRef.current) fileInputRef.current.value = ""; // Clear the new selection
        return;
    }
    
    resetInputState(); // Reset before processing new file
    setFileName(file.name);
    setFileToProcess(file); // Store file for upload

    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === "txt") {
      setProcessingStatus("parsing"); // For TXT, parsing is client-side
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setPastedText(text);
        onTextReady(text);
        setProcessingStatus("completed");
        toast({
          title: "TXT File Processed",
          description: `Content from ${file.name} has been loaded.`,
        });
      };
      reader.onerror = () => {
        setProcessingStatus("failed");
        toast({
          title: "Error Reading TXT File",
          description: `Could not read content from ${file.name}.`,
          variant: "destructive",
        });
      };
      reader.readAsText(file);
    } else if (fileExtension === "pdf" || fileExtension === "docx") {
      if (!currentUser) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to upload PDF/DOCX files for processing.",
          variant: "destructive",
        });
        resetInputState();
        return;
      }
      // Start server-side processing for PDF/DOCX
      setProcessingStatus("uploading");
      
      // Create a unique ID for the Firestore document to track this file
      const firestoreDocRef = doc(db, 'parsedDocuments', doc(db, 'parsedDocuments').id); // Generates a new ID
      const firestoreDocId = firestoreDocRef.id;

      // Store initial metadata in Firestore
      try {
        await setDoc(firestoreDocRef, {
          originalFileName: file.name,
          userId: currentUser.uid,
          status: 'uploading',
          createdAt: serverTimestamp(),
          contentType: file.type,
        });
      } catch (error) {
        console.error("Error creating Firestore entry:", error);
        toast({ title: "Upload Error", description: "Could not initiate file upload process. Please try again.", variant: "destructive" });
        resetInputState();
        return;
      }

      // Upload to Firebase Storage
      // Naming convention: firestoreDocId_originalFileName to link Storage file to Firestore doc easily in function
      const storagePath = `uploads/${currentUser.uid}/${firestoreDocId}_${file.name}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
          setProcessingStatus("failed");
          toast({ title: "Upload Failed", description: `Could not upload ${file.name}. Please try again.`, variant: "destructive" });
          setDoc(firestoreDocRef, { status: 'failed', error: 'Upload to storage failed' }, { merge: true });
          resetInputState(); // Consider if full reset is best or just allow retry
        },
        async () => {
          // Upload completed successfully, Cloud Function will take over parsing.
          // Client will listen to Firestore for updates.
          toast({ title: "Upload Complete", description: `${file.name} uploaded. Parsing will begin shortly.` });
          setProcessingStatus("parsing"); // UI reflects that parsing is next
          await setDoc(firestoreDocRef, { status: 'uploaded', storagePath: storagePath }, { merge: true });


          // Listen to Firestore for parsing results
          if (firestoreUnsubscribeRef.current) {
            firestoreUnsubscribeRef.current(); // Unsubscribe from any previous listener
          }
          firestoreUnsubscribeRef.current = onSnapshot(firestoreDocRef, (docSnap) => {
            const data = docSnap.data();
            if (data) {
              if (data.status === 'completed' && data.extractedText) {
                setPastedText(data.extractedText);
                onTextReady(data.extractedText);
                setProcessingStatus("completed");
                toast({ title: "Parsing Complete", description: `Text extracted from ${data.originalFileName}.` });
                if (firestoreUnsubscribeRef.current) firestoreUnsubscribeRef.current(); // Stop listening
              } else if (data.status === 'parsing') {
                setProcessingStatus("parsing"); // Keep UI in parsing state
              } else if (data.status === 'failed') {
                setProcessingStatus("failed");
                toast({ title: "Parsing Failed", description: data.error || `Could not parse ${data.originalFileName}.`, variant: "destructive" });
                if (firestoreUnsubscribeRef.current) firestoreUnsubscribeRef.current(); // Stop listening
              }
            }
          }, (error) => {
            console.error("Error listening to Firestore document:", error);
            setProcessingStatus("failed");
            toast({ title: "Error", description: "Lost connection to parsing status updates.", variant: "destructive" });
          });
        }
      );
    } else {
      // Unsupported file type
      setProcessingStatus("failed");
      toast({
        title: "Unsupported File Type",
        description: `Uploaded ${file.name}. Please use .txt, .pdf, or .docx files.`,
        variant: "default",
        duration: 7000,
      });
      resetInputState();
    }
  }, [onTextReady, toast, currentUser, processingStatus]);

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = event.target.value;
    setPastedText(newText);
    onTextReady(newText);
     // If user types and a file was being processed/uploaded, it might be confusing.
     // Consider if we should reset file processing state here or disable textarea during processing.
     // For now, if text changes, we assume manual input is overriding file processing.
     if (newText && (processingStatus === "uploading" || processingStatus === "parsing")) {
        // Potentially stop the upload/parsing or warn the user.
        // For simplicity, let's reset the file processing state if user types.
        // This is a UX decision.
        resetInputState();
        // Alternatively, disable textarea while processingStatus is 'uploading' or 'parsing'.
     } else if (newText && fileName) { 
        // If user types, and there was a file name displayed (but not processing), clear the file name.
        setFileName(null); 
        if (fileInputRef.current) fileInputRef.current.value = ""; 
     }
  };

  const isProcessingFile = processingStatus === "uploading" || processingStatus === "parsing";
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-semibold text-xl">Provide Your Content</CardTitle>
        <CardDescription>Upload .txt (direct read), .pdf, or .docx (server-side parsing) files, or paste text.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file-upload" className="flex items-center gap-2 cursor-pointer text-sm font-medium">
            <UploadCloud className="w-4 h-4 text-primary" />
            <span>Upload File (.txt, .pdf, .docx)</span>
          </Label>
          <Input 
            id="file-upload" 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange} 
            accept=".txt,.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
            className="p-2 hover:border-primary transition-colors"
            disabled={isGeneratingFlashcards || isProcessingFile}
          />
          {fileName && <p className="text-xs text-muted-foreground mt-1">Selected file: {fileName}</p>}
          {processingStatus === "uploading" && (
            <div className="mt-2">
              <Label className="text-xs text-muted-foreground">Uploading: {Math.round(uploadProgress)}%</Label>
              <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          )}
          {processingStatus === "parsing" && (
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              <span>Processing file, please wait...</span>
            </div>
          )}
           {processingStatus === "failed" && (
            <p className="text-xs text-destructive mt-1">File processing failed. Please try a different file or paste text.</p>
          )}
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="text-input" className="text-sm font-medium">Paste Text</Label>
          <Textarea
            id="text-input"
            placeholder={
              isProcessingFile 
                ? "Waiting for file processing to complete..." 
                : "Paste your content here from any source..."
            }
            value={pastedText}
            onChange={handleTextChange}
            rows={8}
            className="resize-none"
            disabled={isGeneratingFlashcards || isProcessingFile}
          />
        </div>
      </CardContent>
    </Card>
  );
}
