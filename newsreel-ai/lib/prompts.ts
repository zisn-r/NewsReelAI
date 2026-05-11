import fs from 'fs';
import path from 'path';

interface PromptConfig {
  system: string;
  user: string;
  temperature: number;
  maxTokens: number;
}

export async function loadPromptConfig(
  workflowName: 'news_to_script' | 'topic_validation',
  topic: string
): Promise<PromptConfig> {
  const promptDir = path.join(process.cwd(), 'prompts');
  
  // Load settings
  const settings = JSON.parse(
    fs.readFileSync(path.join(promptDir, 'settings.json'), 'utf-8')
  );

  let system = '';
  let user = '';

  if (workflowName === 'news_to_script') {
    // Combine all system prompts
    system = [
      'system/journalist_role_v1.0.md',
      'system/video_script_optimization_v1.0.md',
      'system/source_validation_v1.1.md'
    ]
      .map(file => readPrompt(promptDir, file))
      .join('\n\n---\n\n');

    // Load and format user prompt
    user = readPrompt(promptDir, 'user/news_to_script_v1.0.md')
      .replace(/{topic}/g, topic);
  }

  if (workflowName === 'topic_validation') {
    system = readPrompt(promptDir, 'system/journalist_role_v1.0.md');
    user = readPrompt(promptDir, 'user/topic_validation_v1.0.md')
      .replace(/{topic}/g, topic);
  }

  return {
    system,
    user,
    temperature: settings.generation_config.temperature,
    maxTokens: settings.generation_config.maxOutputTokens
  };
}

function readPrompt(promptDir: string, relativePath: string): string {
  const filePath = path.join(promptDir, relativePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract prompt text (skip markdown headers)
  const lines = content.split('\n');
  const promptStart = lines.findIndex(line => line === '## Prompt Text');
  
  if (promptStart === -1) {
    return content;
  }

  return lines
    .slice(promptStart + 1)
    .filter(line => line.trim() && !line.startsWith('#'))
    .join('\n')
    .trim();
}
