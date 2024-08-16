import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createMistral } from '@ai-sdk/mistral'
import { createOpenAI } from '@ai-sdk/openai'
import { experimental_createProviderRegistry as createProviderRegistry } from 'ai'

export const registry = createProviderRegistry({
  openai: createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    compatibility: 'strict'
  }),

  anthropic: createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  }),
  bedrock: createAmazonBedrock({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region: process.env.AWS_REGION!
  }),
  google: createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY
  }),
  mistral: createMistral({
    apiKey: process.env.MISTRAL_API_KEY
  }),
  groq: createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY
  }),
  local: createOpenAI({
    baseURL: 'http://localhost:1234/v1/'
  })
})

export const models = [
  {
    displayName: 'GPT-4',
    input: 'openai:gpt-4',
    contextWindow: 8192,
    maxOutput: 8192,
    trainingDate: '2021-09',
    provider: 'Openai'
  },
  {
    displayName: 'GPT-4 Turbo',
    input: 'openai:gpt-4-turbo',
    contextWindow: 128000,
    maxOutput: 4096,
    trainingDate: '2023-12',
    provider: 'Openai'
  },
  {
    displayName: 'GPT-4o',
    input: 'openai:gpt-4o',
    contextWindow: 128000,
    maxOutput: 4096,
    trainingDate: '2023-10',
    provider: 'Openai'
  },
  {
    displayName: 'GPT-4o Mini',
    input: 'openai:gpt-4o-mini',
    contextWindow: 128000,
    maxOutput: 16384,
    trainingDate: '2023-10',
    provider: 'Openai'
  },
  {
    displayName: 'Claude Sonnet 3.5',
    input: 'anthropic:claude-3-5-sonnet-20240620',
    contextWindow: 200000,
    maxOutput: 8192,
    trainingDate: '2024-04',
    provider: 'Anthropic'
  },
  {
    displayName: 'Claude Opus',
    input: 'anthropic:claude-3-opus-20240229',
    contextWindow: 200000,
    maxOutput: 4096,
    trainingDate: '2023-08',
    provider: 'Anthropic'
  },
  {
    displayName: 'Claude Haiku',
    input: 'anthropic:claude-3-haiku-20240307',
    contextWindow: 200000,
    maxOutput: 4096,
    trainingDate: '2023-08',
    provider: 'Anthropic'
  },
  {
    displayName: 'Bedrock - lama 3 70B',
    input: 'bedrock:meta.llama3-70b-instruct-v1:0',
    contextWindow: 0,
    maxOutput: 0,
    trainingDate: '0000-00',
    provider: 'Amazon'
  },
  {
    displayName: 'Gemini 1.5 Flash',
    input: 'google:models/gemini-1.5-flash-latest',
    contextWindow: 2000000,
    maxOutput: 0,
    trainingDate: '0000-00',
    provider: 'Google'
  },
  {
    displayName: 'Gemini 1.5 Pro',
    input: 'google:models/gemini-1.5-pro-latest',
    contextWindow: 2000000,
    maxOutput: 0,
    trainingDate: '0000-00',
    provider: 'Google'
  },
  {
    displayName: 'Mistral Large Latest',
    input: 'mistral:mistral-large-latest',
    contextWindow: 128000,
    maxOutput: 0,
    trainingDate: 'unknown',
    provider: 'Mistral'
  },
  {
    displayName: 'Open Mistral Nemo',
    input: 'mistral:open-mistral-nemo',
    contextWindow: 128000,
    maxOutput: 0,
    trainingDate: 'unknown',
    provider: 'Mistral'
  },
  {
    displayName: 'Groq Llama 3.1 405B Reasoning',
    input: 'groq:llama-3.1-405b-reasoning',
    contextWindow: 128000,
    maxOutput: 8192,
    trainingDate: 'unknown',
    provider: 'Groq'
  },
  {
    displayName: 'Groq Llama 3.1 70B Reasoning',
    input: 'groq:llama-3.1-70b-versatile',
    contextWindow: 128000,
    maxOutput: 8192,
    trainingDate: 'unknown',
    provider: 'Groq'
  },
  {
    displayName: 'Meta LLaMA 3.1 8B Instruct',
    input: 'local:meta-llama-3.1-8b-instruct',
    contextWindow: 0,
    maxOutput: 0,
    trainingDate: 'unknown',
    provider: 'you'
  }
]
