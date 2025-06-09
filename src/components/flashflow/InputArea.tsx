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
          setPastedText(text);
          onTextReady(text);
        };
        reader.readAsText(file);
      } else {
        toast({
          title: "File Type Not Supported",
          description: `Currently, only .txt files can be automatically processed. For ${file.type}, please copy and paste the content.`,
          variant: "destructive",
        });
        event.target.value = ""; 
        setFileName(null);
      }
    }
  }, [onTextReady, toast]);

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => { // Changed to HTMLTextAreaElement
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
    <Card className="w-full"> {/* Removed shadow-lg */}
      <CardHeader>
        <CardTitle className="font-semibold text-xl">Provide Your Content</CardTitle> {/* Adjusted font-headline and text size */}
        <CardDescription>Upload a .txt file or paste your text below.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4"> {/* Reduced spacing */}
        <div className="space-y-2">
          <Label htmlFor="file-upload" className="flex items-center gap-2 cursor-pointer text-sm font-medium"> {/* Explicitly set font style */}
            <UploadCloud className="w-4 h-4 text-primary" /> {/* Slightly smaller icon */}
            <span>Upload File</span>
          </Label>
          <Input 
            id="file-upload" 
            type="file" 
            onChange={handleFileChange} 
            accept=".txt,.pdf,.docx" 
            className="p-2 hover:border-primary transition-colors" // Removed border-dashed, simplified padding
            disabled={isLoading}
          />
          {fileName && <p className="text-xs text-muted-foreground">Uploaded: {fileName}</p>} {/* Smaller text */}
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
          <Label htmlFor="text-input" className="text-sm font-medium">Paste Text</Label> {/* Explicitly set font style */}
          <Textarea
            id="text-input"
            placeholder="Paste your content here..."
            value={pastedText}
            onChange={handleTextChange}
            rows={8} // Reduced rows
            className="resize-none"
            disabled={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
}
