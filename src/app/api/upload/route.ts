import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000 + 1000));

  return NextResponse.json({
    id: crypto.randomUUID(),
    name: file.name,
    size: file.size,
    type: file.type,
    url: `https://mock-storage.com/${file.name}`
  });
}
