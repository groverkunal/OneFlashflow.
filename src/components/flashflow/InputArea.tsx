
"use client";

import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface InputAreaProps {
  onTextReady: (text: string) => void;
  isLoading: boolean;
}

export function InputArea({ onTextReady, isLoading }: InputAreaProps) {
  const [pastedText, setPastedText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension === "txt") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setPastedText(text);
          onTextReady(text);
          toast({
            title: "File Processed",
            description: `${file.name} content has been loaded into the text area.`,
          });
        };
        reader.readAsText(file);
      } else if (fileExtension === "pdf" || fileExtension === "docx") {
        setPastedText(""); // Clear any existing pasted text
        onTextReady("");   // Notify parent that text is now empty
        toast({
          title: `File Type: ${fileExtension?.toUpperCase()}`,
          description: `Uploaded ${file.name}. For ${fileExtension?.toUpperCase()} files, please copy the text content from your document and paste it into the text area below.`,
          variant: "default", 
          duration: 7000, // Longer duration for this important message
        });
        // Keep the file input value so the user sees the selected file, but don't clear it.
        // If they manually paste text later, the text change handler will clear the file name.
      } else {
        setPastedText(""); 
        onTextReady("");
        toast({
          title: "File Type Not Supported for Direct Processing",
          description: `Uploaded ${file.name}. Please copy and paste the content from this file type.`,
          variant: "default",
          duration: 7000,
        });
        // event.target.value = ""; // Don't clear if we want them to see the file selected
        // setFileName(null); // Only nullify if truly unsupported and we want to reset input.
      }
    } else {
      setFileName(null);
      // If no file is selected (e.g., user cancels dialog), ensure text area reflects this
      // Only clear if pastedText wasn't manually entered.
      // This logic might need refinement based on desired UX when canceling file selection.
    }
  }, [onTextReady, toast]);

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = event.target.value;
    setPastedText(newText);
    onTextReady(newText);
     if (newText && fileName) { // If user starts typing after "uploading" a PDF/DOCX
        setFileName(null); 
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = ""; // Clear the file input visually
     }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-semibold text-xl">Provide Your Content</CardTitle>
        <CardDescription>Upload a .txt file (content loaded automatically) or paste text from any document.</CardDescription>
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
            onChange={handleFileChange} 
            accept=".txt,.pdf,.docx" 
            className="p-2 hover:border-primary transition-colors"
            disabled={isLoading}
          />
          {fileName && <p className="text-xs text-muted-foreground">Selected file: {fileName}</p>}
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
            placeholder="Paste your content here from any source (TXT, PDF, DOCX, etc.)..."
            value={pastedText}
            onChange={handleTextChange}
            rows={8}
            className="resize-none"
            disabled={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
}
