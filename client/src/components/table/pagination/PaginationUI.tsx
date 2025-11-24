import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const PaginationUI = ({
  handleRowsPerPageChange,
  rows,
  endItem,
  startItem,
  total,
  page,
  handleFirstPage,
  handlePreviousPage,
  handleNextPage,
  handleLastPage,
  totalPages,
}: any) => {
  return (
    <div>
      <div className="flex w-full items-center justify-end gap-7">
        <div className="h-full">
          <div className="flex items-center space-x-2">
            <p className="text-nowrap text-sm font-medium">Rows per page:</p>
            <Select value={`${rows}`} onValueChange={handleRowsPerPageChange}>
              <SelectTrigger className="h-7 w-[70px] rounded-sm shadow-none scale-90 bg-transparent">
                <SelectValue placeholder={`${rows}`} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Separator orientation="vertical" className="h-5" />
        <div className="h-full">
          <div className="flex items-center justify-center gap-5">
            <div className="h-full text-sm font-medium">
              {endItem ? startItem : 0}-{endItem || 0} of {total || 0}
            </div>
            <div className="flex h-full items-center justify-center space-x-2">
              <Button
                variant="outline"
                onClick={handleFirstPage}
                disabled={page === 1}
                className="h-8 w-8 border-none bg-transparent p-0"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={handlePreviousPage}
                disabled={page === 1}
                className="h-8 w-8 border-none bg-transparent p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={page >= totalPages}
                className="h-8 w-8 border-none bg-transparent p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={handleLastPage}
                disabled={page >= totalPages}
                className="h-8 w-8 border-none bg-transparent p-0"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaginationUI;
