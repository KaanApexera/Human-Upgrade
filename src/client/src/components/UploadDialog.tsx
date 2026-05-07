import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle2, AlertCircle, X, Zap, Lock } from "lucide-react";
import { LoadingLogo } from "./Logo";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: (uploadId: string) => void;
  remainingUploads?: number;
  isUnlimited?: boolean;
}

export function UploadDialog({
  open,
  onOpenChange,
  onUploadComplete,
  remainingUploads = 1,
  isUnlimited = false,
}: UploadDialogProps) {
  const [, setLocation] = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error" | "emergency">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [emergencyMessage, setEmergencyMessage] = useState("");

  const ACCEPTED_TYPES = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
  ];

  const isValidFileType = (file: File) => ACCEPTED_TYPES.includes(file.type);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidFileType(droppedFile)) {
      setFile(droppedFile);
      setStatus("idle");
      setErrorMessage("");
    } else {
      setErrorMessage("Please upload a PDF or image file (PNG, JPG)");
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isValidFileType(selectedFile)) {
      setFile(selectedFile);
      setStatus("idle");
      setErrorMessage("");
    } else {
      setErrorMessage("Please upload a PDF or image file (PNG, JPG)");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setStatus("uploading");
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);

          if (response.isEmergency) {
            setStatus("emergency");
            setEmergencyMessage(response.emergencyMessage);
            setUploading(false);
            return;
          }

          if (response.analysisError) {
            console.warn("Protocol analysis warning:", response.analysisError);
          }
          setStatus("processing");
          setTimeout(() => {
            setStatus("success");
            setTimeout(() => {
              onUploadComplete?.(response.uploadId);
              handleClose();
            }, 1500);
          }, 2000);
        } else if (xhr.status === 403) {
          // Upload limit reached — show upgrade UI
          setStatus("idle");
          setFile(null);
          // Force remainingUploads to 0 so the upgrade wall shows
          setErrorMessage("__limit_reached__");
        } else {
          const error = JSON.parse(xhr.responseText);
          setStatus("error");
          setErrorMessage(error.message || "Upload failed");
        }
        setUploading(false);
      };

      xhr.onerror = () => {
        setStatus("error");
        setErrorMessage("Network error occurred");
        setUploading(false);
      };

      xhr.open("POST", "/api/upload");
      xhr.send(formData);
    } catch (error) {
      setStatus("error");
      setErrorMessage("Upload failed. Please try again.");
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setProgress(0);
    setStatus("idle");
    setErrorMessage("");
    setEmergencyMessage("");
    setUploading(false);
    onOpenChange(false);
  };

  const removeFile = () => {
    setFile(null);
    setStatus("idle");
    setErrorMessage("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-card-border">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Upload Lab Results</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Upload your blood work document or screenshot for analysis
            {!isUnlimited && (
              <span className="block mt-1 text-brand-red">
                {remainingUploads} upload{remainingUploads !== 1 ? "s" : ""} remaining this month
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {(!isUnlimited && remainingUploads <= 0) || errorMessage === "__limit_reached__" ? (
            <div className="py-6 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-brand-red/10 border border-brand-red/20 flex items-center justify-center">
                <Lock className="w-7 h-7 text-brand-red" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground mb-1">Monthly upload limit reached</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Upgrade to Premium for unlimited lab uploads, wearable sync, and full protocol access.
                </p>
              </div>
              <div className="w-full bg-muted/30 border border-border rounded-xl p-4 text-left space-y-2">
                {["Unlimited lab report uploads", "WHOOP & Apple Health sync", "AI meal plan generator", "Advanced trend analysis"].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                    <Zap className="w-4 h-4 text-brand-red flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                  Not now
                </Button>
                <Button
                  className="flex-1 bg-brand-red hover:bg-brand-red/90 rounded-full"
                  onClick={() => { onOpenChange(false); setLocation("/pricing"); }}
                >
                  Upgrade to Premium
                </Button>
              </div>
            </div>
          ) : status === "emergency" ? (
            <div className="py-6 flex flex-col items-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-lg font-bold text-red-500 mb-4">Emergency Safety Notice</p>
              <div className="bg-red-950 border-2 border-red-500 rounded-lg p-4 text-sm text-red-100 whitespace-pre-wrap max-h-64 overflow-y-auto">
                {emergencyMessage}
              </div>
              <Button
                onClick={handleClose}
                variant="outline"
                className="mt-4"
                data-testid="button-close-emergency"
              >
                Close
              </Button>
            </div>
          ) : status === "processing" ? (
            <div className="py-8 flex flex-col items-center">
              <LoadingLogo size={80} />
            </div>
          ) : status === "success" ? (
            <div className="py-8 flex flex-col items-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-lg font-medium text-foreground">Upload Complete!</p>
              <p className="text-sm text-muted-foreground mt-1">Redirecting to your protocol...</p>
            </div>
          ) : (
            <>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center transition-colors
                  ${file ? "border-brand-red bg-brand-red/5" : "border-border hover:border-brand-red/50"}
                `}
                data-testid="upload-dropzone"
              >
                {file ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-red/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-brand-red" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={removeFile}
                      disabled={uploading}
                      data-testid="button-remove-file"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-foreground mb-1">
                      Drag and drop your document here
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">PDF, PNG, or JPG</p>
                    <label>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.webp"
                        onChange={handleFileSelect}
                        className="hidden"
                        data-testid="input-file-upload"
                      />
                      <Button variant="outline" asChild className="cursor-pointer">
                        <span>Browse Files</span>
                      </Button>
                    </label>
                  </>
                )}
              </div>

              {status === "uploading" && (
                <div className="mt-4">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Uploading... {progress}%
                  </p>
                </div>
              )}

              {status === "error" && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{errorMessage}</p>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={handleClose} disabled={uploading}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!file || uploading || (remainingUploads <= 0 && !isUnlimited)}
                  className="bg-brand-red hover:bg-brand-red/90 rounded-full"
                  data-testid="button-upload-submit"
                >
                  {uploading ? "Uploading..." : "Analyze Document"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
