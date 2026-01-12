import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

type FileWithRelativePath = File & {
  webkitRelativePath?: string;
};

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ success: false, message: "No files uploaded" }, { status: 400 });
    }

    const musicDir = path.join(process.cwd(), "public/music");
    fs.mkdirSync(musicDir, { recursive: true });

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const f = file as FileWithRelativePath;

      /**
       * Saat upload folder:
       * - webkitRelativePath berisi "folder/subfolder/file.mp3"
       * Saat upload file biasa:
       * - string kosong ""
       */
      const relativePath = f.webkitRelativePath && f.webkitRelativePath.length > 0 ? f.webkitRelativePath : f.name;

      /**
       * Proteksi path traversal
       */
      const safePath = relativePath.replace(/^(\.\.(\/|\\|$))+/, "");

      const fullPath = path.join(musicDir, safePath);

      /**
       * Pastikan folder tujuan ada
       */
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });

      fs.writeFileSync(fullPath, buffer);
    }

    return NextResponse.json({
      success: true,
      message: `${files.length} file uploaded`,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 });
  }
};
