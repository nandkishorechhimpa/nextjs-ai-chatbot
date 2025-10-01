'use client';
import { DocumentSkeleton } from "@/components/document-skeleton";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

 export default function Page() {
  const [data, setData] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit() {
      try { 
            setIsSubmitting(true);
      // Handle the submission of dummy data here
      console.log("Submitted data:", data);
      const response = await fetch('/api/content', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: data }),
      });
      const result = await response.json();
      toast.success("Data submitted successfully!");
      setIsSubmitting(false);
         setData("");

      } catch (error) {
        console.error("Error submitting data:", error);   
      toast.error("Error submitting data!");
         setIsSubmitting(false);
         setData("");
        
      }
    }


if(isSubmitting) {
      return <DocumentSkeleton artifactKind="text" />;
    }

  return <div className="px-20 py-20  ">
    <h1 className="text-2xl font-bold mb-4">Enter your dummy data</h1>

    <Textarea placeholder="Enter text..."  rows={10} className="resize-none" value={data} onChange={(e)=> setData(e.target.value)} />
    <Button className="mt-2" onClick={handleSubmit}>Submit</Button>
  
  
  
  </div>;
}   