'use client';
import { DocumentSkeleton } from "@/components/document-skeleton";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Header } from "@/components/header";
import { Tabs } from "radix-ui";
import { Fileupload } from "@/components/ui/file-upload";

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

  return (
   <>
    <header className="sticky top-0 flex items-center gap-2 bg-background px-2 py-1.5 md:px-2 shadow-sm ">
        <Header/>
    </header>

   <Tabs.Root className="TabsRoot mt-10" defaultValue="tab1">
		<Tabs.List className="TabsList flex justify-center gap-4" aria-label="Select the type of data to input">
			<Tabs.Trigger className="TabsTrigger primary-text-color font-medium" value="text">
				Text
			</Tabs.Trigger>
			<Tabs.Trigger className="TabsTrigger primary-text-color font-medium" value="document">
				Document
			</Tabs.Trigger>
		</Tabs.List>
    <Tabs.Content className="TabsContent" value="text">
      <div className="px-20 py-20  "> 

            <h1 className="text-2xl font-bold mb-4">Enter your dummy data</h1>
            <Textarea placeholder="Enter text..."  rows={10} className="resize-none" value={data} onChange={(e)=> setData(e.target.value)} />
            <Button className="mt-2 primary-button-color" onClick={handleSubmit}>Submit</Button>
    </div>
    </Tabs.Content>
    <Tabs.Content className="TabsContent" value="document">
      <div className="px-20 py-20  "> 
            <h1 className="text-2xl font-bold mb-4">Choose file for input:</h1>
            
                 <Fileupload/>
            <Button className="mt-2 primary-button-color" onClick={handleSubmit}>Submit</Button>
    </div>
    </Tabs.Content>

   
	</Tabs.Root>
   
 
   </> 
  );
}   