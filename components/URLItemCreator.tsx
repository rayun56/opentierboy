"use client";

import React, {useCallback, useRef, useState} from 'react'
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import * as z from "zod"
import {Button} from "@/components/ui/button"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import Image from 'next/image'
import Item from "@/models/Item";
import {useTierContext} from "@/contexts/TierContext";

const formSchema = z.object({
  urls: z.any().refine((urls) => urls?.length > 0, "At least one url is required."),
})

interface ItemCreatorProps {
  onItemsCreate: (items: Item[]) => void;
}

interface UploadedItem {
  id: string;
  content: string;
  imageUrl: string;
}

const generateId = () => Math.random().toString(36).slice(2, 11);

const URLItemCreator: React.FC<ItemCreatorProps> = ({onItemsCreate}) => {
  const {tierCortex} = useTierContext();

  const [uploadedItems, setUploadedItems] = useState<UploadedItem[]>([]);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      urls: undefined,
    },
  })

  const onSubmit = useCallback((values: z.infer<typeof formSchema>) => {
    if (values.urls && values.urls.length > 0) {
      tierCortex.addCustomItems(uploadedItems);
      onItemsCreate(uploadedItems);

      setUploadedItems([]);
      form.reset();
      if (urlInputRef.current) {
        urlInputRef.current.value = '';
      }
    }
  }, [tierCortex, uploadedItems, onItemsCreate, form]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (urlInputRef.current) {
      const url = urlInputRef.current.value;
      if (url) {
        try {
          // Always get an array, or initialize as empty array
          const urls: Array<URL> = form.getValues('urls') || [];
          const newUrls = [...urls, new URL(url)];
          form.setValue('urls', newUrls);
          urlInputRef.current.value = '';
          const newItems = newUrls.map(urlObj => ({
            id: generateId(),
            content: 'Change Me!',
            imageUrl: urlObj.toString()
          }));
          setUploadedItems(newItems);
        } catch (error) {
          form.setError('urls', {
            type: 'manual',
            message: 'Please enter a valid URL.',
          });
          return;
        }
      } else {
        form.setError('urls', {
          type: 'manual',
          message: 'Please enter a valid URL.',
        });
      }
    }
  };

  const handleNameChange = (id: string, newName: string) => {
    setUploadedItems((prev) =>
      prev.map((item) => (item.id === id ? {...item, content: newName} : item))
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col overflow-y-hidden">
        <FormField
          control={form.control}
          name="urls"
          render={({field}) => (
            <FormItem>
              <FormLabel>Attach Images</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="Enter image URL and click submit"
                  ref={urlInputRef}
                  className="w-11/12 ml-1"
                />
              </FormControl>
              <Button type="button" onClick={handleUrlChange} className="mt-2">
                Submit
              </Button>
              <FormDescription>
                Click &#39;submit&#39; for each URL to add it to the list.
              </FormDescription>
              <FormMessage/>
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4 overflow-y-auto pe-6">
          {uploadedItems.map((item) => (
            <div key={item.id} className="space-y-2">
              <div className="w-28 h-28 relative">
                <Image src={item.imageUrl} alt={item.content} style={{objectFit: 'cover'}} fill
                />
              </div>
              <Input
                type="text"
                value={item.content}
                onChange={(e) => handleNameChange(item.id, e.target.value)}
                placeholder="Item name"
              />
            </div>
          ))}
        </div>
        <div className="pt-4">
          <Button type="submit" disabled={uploadedItems.length === 0}>
            Add {uploadedItems.length} Item{uploadedItems.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default URLItemCreator;
