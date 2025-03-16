import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ExternalLink, FileText, ImageIcon } from "lucide-react"
import { paths } from "@/types/schema.v1"

type Files = paths["/v1/events/{eventID}/files"]["get"]["responses"]["200"]["content"]["application/json"]["eventFiles"]
type File = Files[number]

function FilesTable({ files }: { files: Files }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const getFileType = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase() || ""

    if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension)) {
      return "image"
    } else if (["pdf"].includes(extension)) {
      return "pdf"
    } else {
      return "other"
    }
  }

  const handleOpenFile = (file: File) => {
    const fileType = getFileType(file.name)

    if (fileType === "image") {
      setSelectedFile(file)
    } else {
      // For non-image files, we would open in a new tab
      // In a real app, this would link to the actual file URL
      window.open(`#view-file/${file.key}`, "_blank")
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date Added</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => {
            const fileType = getFileType(file.name)
            const FileIcon = fileType === "image" ? ImageIcon : FileText

            return (
              <TableRow key={file.key}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{file.name}</span>
                  </div>
                </TableCell>
                <TableCell>{new Date(file.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => handleOpenFile(file)} title="Open file">
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">Open</span>
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {/* Image Preview Dialog */}
      <Dialog open={selectedFile !== null} onOpenChange={(open) => !open && setSelectedFile(null)}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{selectedFile?.name}</DialogTitle>
          </DialogHeader>
          <div className="relative w-full aspect-video">
            {selectedFile && (
              <img
                src={`/placeholder.svg?height=400&width=800`}
                alt={selectedFile.name}
                className="object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export { FilesTable }
