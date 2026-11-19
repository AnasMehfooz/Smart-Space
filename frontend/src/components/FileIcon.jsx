import { File, FileImage, FileSpreadsheet, FileText, Presentation } from "lucide-react";

const BY_EXT = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  txt: FileText,
  md: FileText,
  ppt: Presentation,
  pptx: Presentation,
  csv: FileSpreadsheet,
  xls: FileSpreadsheet,
  xlsx: FileSpreadsheet,
};

export function FileIcon({ ext, kind, className }) {
  const Icon = kind === "image" ? FileImage : (BY_EXT[ext?.toLowerCase()] ?? File);
  return <Icon className={className} />;
}
