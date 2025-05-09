import { useState } from "react";
import { Issue, IssueCategory, IssueStatus } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageDropzone from "./ImageDropzone";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import LocationSearch from "./LocationSearch";

interface IssueFormProps {
  onSubmit: (data: IssueFormData) => void;
  initialData?: Issue;
  isSubmitting?: boolean;
  showStatusField?: boolean;
}

// Form schema for validation
const formSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title must be at least 5 characters" })
    .max(100, { message: "Title cannot exceed 100 characters" }),
  description: z
    .string()
    .min(20, { message: "Description must be at least 20 characters" })
    .max(1000, { message: "Description cannot exceed 1000 characters" }),
  category: z.enum(["road", "water", "sanitation", "electricity", "other"]),
  location: z
    .string()
    .min(5, { message: "Location must be at least 5 characters" })
    .max(200, { message: "Location cannot exceed 200 characters" }),
  status: z.enum(["pending", "in-progress", "resolved"]).optional(),
  // Add coordinate fields
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type IssueFormData = z.infer<typeof formSchema> & {
  imageFile: File | null;
};

const IssueForm = ({ 
  onSubmit, 
  initialData, 
  isSubmitting = false,
  showStatusField = false,
}: IssueFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description,
          category: initialData.category,
          location: initialData.location,
          status: initialData.status,
          latitude: initialData.latitude,
          longitude: initialData.longitude,
        }
      : {
          title: "",
          description: "",
          category: "other" as IssueCategory,
          location: "",
          status: "pending" as IssueStatus,
          latitude: undefined,
          longitude: undefined,
        },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      ...values,
      imageFile,
    });
  };

  const handleImageSelect = (file: File | null) => {
    setImageFile(file);
  };

  const handleLocationSelect = (location: string, lat?: number, lng?: number) => {
    form.setValue("location", location);
    if (lat && lng) {
      form.setValue("latitude", lat);
      form.setValue("longitude", lng);
    }
  };

  // Check if user is creator when editing
  const isOwner = initialData ? user?.id === initialData.userId : true;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issue Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Brief summary of the issue"
                  {...field}
                  maxLength={100}
                />
              </FormControl>
              <FormDescription>
                Provide a clear, concise title that describes the issue.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="road">Road</SelectItem>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="sanitation">Sanitation</SelectItem>
                  <SelectItem value="electricity">Electricity</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Select the category that best describes the issue.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <LocationSearch 
                  value={field.value} 
                  onChange={(location, lat, lng) => handleLocationSelect(location, lat, lng)} 
                />
              </FormControl>
              <FormDescription>
                Search for the address or location of the issue.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status field: only show if editing and showStatusField is true */}
        {(showStatusField && isOwner && !!initialData) && (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Update the current status of this issue.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detailed description of the issue..."
                  className="min-h-[120px]"
                  {...field}
                  maxLength={1000}
                />
              </FormControl>
              <FormDescription>
                Provide details about the issue. What's happening? When did it start?
                How is it affecting the area?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel className="block mb-2">Image (Optional)</FormLabel>
          <ImageDropzone
            onImageSelect={handleImageSelect}
            existingImageUrl={initialData?.imageUrl}
          />
          <p className="text-sm text-muted-foreground mt-2">
            Add a photo to help describe the issue.
          </p>
        </div>

        {isOwner ? (
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? "Submitting..."
              : initialData
              ? "Update Issue"
              : "Submit Issue"}
          </Button>
        ) : (
          <p className="text-sm text-destructive text-center">
            Only the creator of this issue can edit it.
          </p>
        )}
      </form>
    </Form>
  );
};

export default IssueForm;
