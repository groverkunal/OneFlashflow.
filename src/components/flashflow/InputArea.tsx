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
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setPastedText(text); // Update textarea with file content
          onTextReady(text); // Propagate text up
        };
        reader.readAsText(file);
      } else {
        toast({
          title: "File Type Not Supported",
          description: `Currently, only .txt files can be automatically processed. For ${file.type}, please copy and paste the content.`,
          variant: "destructive",
        });
        // Reset file input if not a TXT to allow re-selection or pasting
        event.target.value = ""; 
        setFileName(null);
      }
    }
  }, [onTextReady, toast]);

  const handleTextChange = (event: React.ChangeEvent<Textarea>) => {
    const newText = event.target.value;
    setPastedText(newText);
    onTextReady(newText);
     if (newText && fileName) { // If user types after uploading a file, clear filename
        setFileName(null); 
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = "";
     }
  };
  
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Provide Your Content</CardTitle>
        <CardDescription>Upload a .txt file or paste your text below.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="file-upload" className="flex items-center gap-2 cursor-pointer">
            <UploadCloud className="w-5 h-5 text-primary" />
            <span>Upload File</span>
          </Label>
          <Input 
            id="file-upload" 
            type="file" 
            onChange={handleFileChange} 
            accept=".txt,.pdf,.docx" 
            className="border-dashed border-2 p-4 hover:border-primary transition-colors"
            disabled={isLoading}
          />
          {fileName && <p className="text-sm text-muted-foreground">Uploaded: {fileName}</p>}
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
          <Label htmlFor="text-input">Paste Text</Label>
          <Textarea
            id="text-input"
            placeholder="Paste your content here..."
            value={pastedText}
            onChange={handleTextChange}
            rows={10}
            className="resize-none"
            disabled={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
}
