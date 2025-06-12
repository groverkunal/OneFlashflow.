
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
            title: "TXT File Processed",
            description: `Content from ${file.name} has been loaded into the text area.`,
          });
        };
        reader.readAsText(file);
      } else if (fileExtension === "pdf" || fileExtension === "docx") {
        setPastedText(""); 
        onTextReady("");   
        toast({
          title: `File Type: ${fileExtension?.toUpperCase()}`,
          description: `Uploaded ${file.name}. The text area is ready for you to paste content from this ${fileExtension?.toUpperCase()} file. Direct parsing is not currently supported.`,
          variant: "default", 
          duration: 7000,
        });
      } else {
        setPastedText(""); 
        onTextReady("");
        setFileName(file.name); // Keep filename displayed for unsupported types too
        toast({
          title: "Unsupported File Type for Direct Processing",
          description: `Uploaded ${file.name}. Please copy text from this file and paste it into the text area.`,
          variant: "default",
          duration: 7000,
        });
      }
    } else {
      // User cancelled file dialog or no file selected
      setFileName(null);
      // Optionally, you might want to clear pastedText if a file was previously loaded
      // and now the file input is cleared. For now, we'll leave pastedText as is.
      // setPastedText("");
      // onTextReady("");
    }
  }, [onTextReady, toast]);

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = event.target.value;
    setPastedText(newText);
    onTextReady(newText);
     if (newText && fileName) { 
        setFileName(null); 
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = ""; 
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

