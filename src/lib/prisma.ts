type MessageRole = 'user' | 'assistant'

type MessageInput = {
  userId: string
  role: MessageRole
  content: string
}

type MessageRecord = MessageInput & { id: string; createdAt: string }

const createMessage = async ({ data }: { data: MessageInput }): Promise<MessageRecord> => {
  const timestamp = new Date().toISOString()
  const record: MessageRecord = {
    id: `${timestamp}-${Math.random().toString(36).slice(2)}`,
    createdAt: timestamp,
    ...data
  }

  if (process.env.NODE_ENV !== 'production') {
    console.info('[mock prisma] message.create', record)
  }

  return record
}

export const prisma = {
  message: {
    create: createMessage
  }
}

export type PrismaClient = typeof prisma
