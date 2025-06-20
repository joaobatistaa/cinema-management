import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { readdir, unlink } from 'fs/promises';

async function importSingleFile(file) {
  // Verifica se o ficheiro é JSON
  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    throw new Error('Apenas ficheiros JSON são permitidos');
  }

  // Lê o conteúdo do ficheiro
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Cria o diretório de backups se não existir
  const uploadsDir = path.join(process.cwd(), 'src', 'data');
  await fs.mkdir(uploadsDir, { recursive: true });

  const fileName = file.name;
  const filePath = path.join(uploadsDir, fileName);

  // Escreve o ficheiro, substituindo se já existir
  await fs.writeFile(filePath, buffer, { flag: 'w' });
  
  return fileName;
}

async function importAllFiles(files) {
  const uploadsDir = path.join(process.cwd(), 'src', 'data');
  
  // Limpa a pasta de destino
  try {
    const files = await readdir(uploadsDir);
    await Promise.all(files.map(file => 
      unlink(path.join(uploadsDir, file))
    ));
  } catch (error) {
    // Se a pasta não existir, cria
    if (error.code !== 'ENOENT') throw error;
  }
  
  await fs.mkdir(uploadsDir, { recursive: true });
  
  // Processa cada ficheiro
  const results = [];
  for (const file of files) {
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      const fileName = await importSingleFile(file);
      results.push(fileName);
    }
  }
  
  return results;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const mode = formData.get('mode') || 'single'; // 'single' ou 'all'
    const files = formData.getAll('files');
    
    if ((!files || files.length === 0) || (mode === 'single' && !files[0])) {
      return NextResponse.json(
        { error: 'Nenhum ficheiro fornecido' },
        { status: 400 }
      );
    }

    let result;
    if (mode === 'all') {
      const importedFiles = await importAllFiles(files);
      result = {
        success: true,
        message: `${importedFiles.length} ficheiros importados com sucesso`,
        files: importedFiles
      };
    } else {
      // Modo single file
      const fileName = await importSingleFile(files[0]);
      result = {
        success: true,
        message: 'Ficheiro carregado com sucesso',
        fileName
      };
    }
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Erro ao processar upload:', error);
    return NextResponse.json(
      { error: 'Erro ao processar o ficheiro' },
      { status: 500 }
    );
  }
}
