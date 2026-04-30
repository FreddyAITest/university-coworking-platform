import Anthropic from '@anthropic-ai/sdk';

let ai = null;

function getAI() {
  if (!ai) {
    ai = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return ai;
}

export async function classifyDocument(name, content, folders) {
  const anthropic = getAI();
  const folderList = folders.map(f => `- ${f}`).join('\n');

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 200,
    system: 'You are a document classifier. Output only a JSON object with keys "folder" (target folder path) and "confidence" (0-1). No other text.',
    messages: [{
      role: 'user',
      content: `Classify this document and choose the best target folder.\n\nAvailable folders:\n${folderList}\n\nDocument name: ${name}\n\nFirst 1000 chars of content:\n${(content || '').slice(0, 1000)}\n\nReturn JSON: {"folder": "...", "confidence": 0.0}`,
    }],
  });

  try {
    const text = msg.content[0]?.text || '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { folder: '/Unsorted', confidence: 0 };
  } catch {
    return { folder: '/Unsorted', confidence: 0 };
  }
}

export async function extractTasks(content, period) {
  const anthropic = getAI();

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    system: 'You extract tasks from documents. Output only a JSON array of task objects. Each task has: title, description, priority (high/medium/low), due_date (ISO or null). No other text.',
    messages: [{
      role: 'user',
      content: `Extract all tasks for the ${period} period from this document content. Return a JSON array.\n\nContent:\n${(content || '').slice(0, 4000)}`,
    }],
  });

  try {
    const text = msg.content[0]?.text || '[]';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch {
    return [];
  }
}
