import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { PassThrough } from 'stream';

const DATA_DIR = path.join(process.cwd(), 'src/data');

function bufferToStream(buffer) {
  const stream = new PassThrough();
  stream.end(buffer);
  return stream;
}

export async function GET() {
  try {
    // Verificar se o diretório existe
    if (!fs.existsSync(DATA_DIR)) {
      return NextResponse.json(
        { error: 'Diretório de backups não encontrado' },
        { status: 404 }
      );
    }

    // Ler os arquivos do diretório
    const files = fs.readdirSync(DATA_DIR)
      .filter(file => file.endsWith('.json'))
      .map(file => ({
        name: file,
        path: path.join(DATA_DIR, file)
      }));

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum arquivo de backup encontrado' },
        { status: 404 }
      );
    }

    return new Promise((resolve, reject) => {
      const chunks = [];
      const archive = archiver('zip');
      
      // Capturar erros no processo de arquivamento
      archive.on('error', (err) => {
        console.error('Erro ao criar arquivo ZIP:', err);
        reject(err);
      });

      // Capturar os dados do ZIP
      archive.on('data', (chunk) => {
        chunks.push(chunk);
      });

      // Quando terminar de criar o ZIP
      archive.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const stream = bufferToStream(buffer);
        
        const response = new Response(stream, {
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': 'attachment; filename=backups.zip',
            'Content-Length': buffer.length.toString()
          }
        });
        
        resolve(response);
      });

      // Adicionar cada arquivo ao ZIP
      files.forEach(file => {
        archive.file(file.path, { name: file.name });
      });
      
      // Finalizar o arquivo ZIP
      archive.finalize();
    });
    
  } catch (error) {
    console.error('Erro ao criar arquivo ZIP:', error);
    return NextResponse.json(
      { error: 'Erro ao processar o pedido' },
      { status: 500 }
    );
  }
}
