import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function GET() {
  try {
    console.log('Received request to list backup files');
    
    // Define the data directory path
    const dataDir = path.join(process.cwd(), 'src', 'data');
    console.log('Looking for data directory at:', dataDir);
    
    try {
      // Check if directory exists
      const dirExists = await fs.access(dataDir).then(() => true).catch(() => false);
      
      if (!dirExists) {
        console.log('Data directory does not exist, creating it...');
        await fs.mkdir(dataDir, { recursive: true });
        console.log('Data directory created successfully');
        return NextResponse.json([]);
      }
      
      console.log('Data directory exists, reading contents...');
      // Read the directory contents
      const files = await fs.readdir(dataDir);
      console.log(`Found ${files.length} files in directory`);
      
      if (files.length === 0) {
        console.log('No files found in data directory');
        return NextResponse.json([]);
      }
      
      // Filter for .json files and get their stats
      const jsonFiles = [];
      
      for (const file of files) {
        try {
          if (file.endsWith('.json')) {
            const filePath = path.join(dataDir, file);
            const stats = await fs.stat(filePath);
            
            jsonFiles.push({
              name: file,
              size: formatFileSize(stats.size),
              lastModified: stats.mtime,
              path: filePath
            });
          }
        } catch (fileError) {
          console.error(`Error processing file ${file}:`, fileError);
          // Continue with next file
        }
      }
      
      console.log(`Found ${jsonFiles.length} JSON files`);
      
      // Sort by last modified date (newest first)
      jsonFiles.sort((a, b) => b.lastModified - a.lastModified);
      
      return NextResponse.json(jsonFiles);
      
    } catch (dirError) {
      console.error('Error accessing/reading data directory:', dirError);
      throw new Error(`Failed to access data directory: ${dirError.message}`);
    }
    
  } catch (error) {
    console.error('Error in GET /api/backups:', error);
    return NextResponse.json(
      { 
        error: 'Failed to read backup files',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

