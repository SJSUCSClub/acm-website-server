import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ExternalLink, FileIcon, Trash } from 'lucide-react';
import { paths } from '@/types/schema.v1';
import { formatDate } from '@/utils/formatter';
import Btn from '@/components/atoms/btn';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';

export type File =
  paths['/v1/events/{eventID}/files']['get']['responses']['200']['content']['application/json']['eventFiles'][number];

export interface IFilesTableProps {
  files: File[];
  admin?: boolean;
  onFileDelete?: (fileKey: File) => void;
}

function FilesTable({ files, admin = false, onFileDelete = () => {} }: IFilesTableProps) {
  return (
    <div>
      {files.length === 0 ? (
        <div className="text-text text-center my-10">No files found</div>
      ) : (
        <Table className="overflow-x-auto border rounded-md">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date Added</TableHead>
              <TableHead className="w-[100px]"></TableHead>
              {admin && <TableHead className="w-[100px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => {
              return (
                <TableRow key={file.key}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{file.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(file.createdAt)}</TableCell>
                  <TableCell>
                    <a href={file.url} target="_blank">
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">Open</span>
                    </a>
                  </TableCell>
                  {admin && (
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger>
                          <Btn variant="ghost" size="sm">
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Btn>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the file.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="flex items-center justify-between text-sm p-3 bg-gray-100 rounded-md">
                            <div className="flex items-center gap-2 truncate">
                              <FileIcon className="h-4 w-4 text-gray-500" />
                              <span className="truncate">{file.name}</span>
                            </div>
                            <p>{formatDate(file.createdAt)}</p>
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction asChild>
                              <Btn className="bg-red-500" onClick={() => onFileDelete(file)}>
                                Delete
                              </Btn>
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export { FilesTable };
