import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ExternalLink, FileIcon } from 'lucide-react';
import { paths } from '@/types/schema.v1';
import { formatDate } from '@/utils/formatter';

export type Files =
  paths['/v1/events/{eventID}/files']['get']['responses']['200']['content']['application/json']['eventFiles'];

function FilesTable({ files }: { files: Files }) {
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
                    <a href={file.key} target="_blank">
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">Open</span>
                    </a>
                  </TableCell>
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
