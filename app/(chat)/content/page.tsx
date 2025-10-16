'use client';
import { DocumentSkeleton } from "@/components/document-skeleton";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRef, useState } from "react";
import { Header } from "@/components/header";
import { Tabs } from "radix-ui";
import { Fileupload } from "@/components/ui/file-upload";
import { put, type PutBlobResult } from '@vercel/blob';
import { Loader } from "@/components/elements/loader";
import { ArtifactKind } from "@/components/artifact";
import { useSession } from "next-auth/react";
import { user } from "@/lib/db/schema";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";



export default function Page() {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const { data, status } = useSession();
  const [scrapeWebsiteUrl, setScrapeWebsiteUrl] = useState("");

  async function handleSubmit() {
    try {
      setIsSubmitting(true);
      // Handle the submission of dummy data here
      console.log("Submitted data:", text);
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text }),
      });
      const result = await response.json();
      toast.success("Data submitted successfully!");
      setIsSubmitting(false);
      setText("");

    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Error submitting data!");
      setIsSubmitting(false);
      setText("");

    }
  }

  const handleFileUpload = async () => {
    try {
      setUploading(true);
      if (!inputFileRef.current?.files) {
        throw new Error('No file selected');
      }

      const file = inputFileRef.current.files[0];
      console.log("Selected file:", file);

      const token = await fetch('/api/blob-token');
      const { token: blobToken } = await token.json();

      if (!blobToken) {
        throw new Error('Blob token not available');
      }
      console.log("Uploading file with token:", blobToken);
      const newBlob = await put(`resources/${file.name}`, file, {
        token: blobToken,
        access: 'public',
        multipart: true,
      });
      console.log('File uploaded successfully:', newBlob);
      toast.success("File uploaded successfully!");
      setBlob(newBlob);
      try {
        // let payload = {
        //   "blob": {
        //     "url": "https://01upq4ouxtku1lug.public.blob.vercel-storage.com/resources/RAG-article-bVM3klZGCFOgJQjtTdjoc1J7ySA1yh.pdf",
        //     "downloadUrl": "https://01upq4ouxtku1lug.public.blob.vercel-storage.com/resources/RAG-article-bVM3klZGCFOgJQjtTdjoc1J7ySA1yh.pdf?download=1",
        //     "pathname": "resources/RAG-article.pdf",
        //     "contentType": "application/pdf",
        //     "contentDisposition": "inline; filename=\"RAG-article.pdf\""
        //   },
        //   "userId": "8d89bb11-2d6c-4bfe-a9eb-56801e6f84b3"
        // };
        const userId = data?.user.id;
        const response = await fetch('/api/files/upload',
          {
            method: 'POST',
            body: JSON.stringify({ blob: newBlob, userId: userId ? userId : null }),
            // body: JSON.stringify(payload),

            headers: {
              'Content-Type': 'application/json',
            },
          });
        console.log('Processing uploaded file:', response);
        if (!response.ok) {
          throw new Error('Failed to process uploaded file');
        }
        const result = await response.json();
        console.log('File processed successfully:', result);
      } catch (error) {
        console.log(error);

      }

    } catch (error) {
      console.log(error);
      toast.error("Error uploading file!");
      setUploading(false)

    }
    finally {
      setUploading(false)
    }
  }

  const handleUrlSubmit = async () => {
    try {
      setUploading(true);

      if (!scrapeWebsiteUrl || !isUrlValid(scrapeWebsiteUrl)) {
        toast.error("Please enter a valid URL");
        setUploading(false);
        return;
      }
      const response = await fetch('/api/source',
        {
          method: 'POST',
          body: JSON.stringify({ url: [scrapeWebsiteUrl], userId: data?.user?.id }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
      console.log('Processing website scrapping:', response);
      if (!response.ok) {
        throw new Error('Failed to process uploaded file');
      }
      const result = await response.json();
      console.log('File processed successfully:', result);
      toast.success("URL submitted successfully!");
      setUploading(false);


    } catch (error) {
      console.log("Error submitting URL:", error);
      setUploading(false)


    }
  }

  //validate url
  const isUrlValid = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  }


  if (isSubmitting) {
    return <DocumentSkeleton artifactKind="text" />;
  }
  if (uploading) {
    return <Loader />;
  }

  return (
    <>
      <header className="sticky top-0 flex items-center gap-2 bg-background px-2 py-1.5 md:px-2 shadow-sm ">
        <Header />
      </header>

      <Link href={"/"} className="flex left-1 pl-10 w-fit mt-4 border-gray-400 hover:underline hover:cursor-pointer items-center gap-1 text-black">

        <ArrowLeft className="text-[20px] w-[20px]" /> Back
      </Link>
      <Tabs.Root className="TabsRoot mt-10" defaultValue="text">

        <Tabs.List className="TabsList flex justify-center gap-4" aria-label="Select the type of data to input">
          <Tabs.Trigger className="TabsTrigger primary-text-color font-medium" value="text">
            Text
          </Tabs.Trigger>
          <Tabs.Trigger className="TabsTrigger primary-text-color font-medium" value="document">
            Document
          </Tabs.Trigger>
          <Tabs.Trigger className="TabsTrigger primary-text-color font-medium" value="url">
            Website (URL)
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content className="TabsContent" value="text">
          <div className="px-20 py-20  ">
            <h1 className="text-2xl font-bold mb-4">Enter your dummy data</h1>
            <Textarea placeholder="Enter text..." rows={10} className="resize-none" value={text} onChange={(e) => setText(e.target.value)} />
            <Button className="mt-2 primary-button-color" onClick={handleSubmit}>Submit</Button>
          </div>
        </Tabs.Content>

        <Tabs.Content className="TabsContent" value="document">
          <div className="px-20 py-20  ">
            <h1 className="text-2xl font-bold mb-4">Choose file for input:</h1>
            <Fileupload
              // onFileSelect={onFileSelect} 
              inputFileRef={inputFileRef}
            />
            <Button className="mt-2 primary-button-color" onClick={handleFileUpload}>Upload</Button>
          </div>
        </Tabs.Content>

        <Tabs.Content className="TabsContent" value="url">
          <div className="px-20 py-20  ">
            <h1 className="text-2xl font-bold mb-4">Scrape website data from URL</h1>
            <Input placeholder="Enter URL..." className="resize-none" name="url" value={scrapeWebsiteUrl} onChange={(e) => setScrapeWebsiteUrl(e.target.value)} />
            <Button className="mt-2 primary-button-color" onClick={handleUrlSubmit}>Submit</Button>
          </div>
        </Tabs.Content>

      </Tabs.Root>
    </>
  );
}   