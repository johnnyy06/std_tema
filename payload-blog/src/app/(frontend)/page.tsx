// payload-blog/src/app/(frontend)/page.tsx
import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import type { JSX } from 'react'
import config from '@/payload.config'
import './styles.css'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  // Get iframe URLs from environment variables
  const chatUrl = process.env.VUE_CHAT_FRONTEND_URL || 'http://localhost:30090'
  const aiUrl = process.env.VUE_AI_FRONTEND_URL || 'http://localhost:30098'

  // Fetch the first published post
  const { docs: posts } = await payload.find({
    collection: 'posts',
    where: {
      status: {
        equals: 'published'
      }
    },
    sort: '-publishedDate',
    limit: 1,
    depth: 2,
  })

  const post = posts[0]

  // Function to render Lexical rich text content
  const renderLexicalNode = (node: any, key: number = 0): React.ReactNode => {
    if (!node) return null

    // Handle text nodes
    if (node.type === 'text') {
      let text: React.ReactNode = node.text || ''

      // Apply formatting based on the format number
      if (node.format & 1) { // Bold
        text = <strong key={key}>{text}</strong>
      }
      if (node.format & 2) { // Italic
        text = <em key={key}>{text}</em>
      }
      if (node.format & 4) { // Underline
        text = <u key={key}>{text}</u>
      }

      return text
    }

    // Handle paragraph nodes
    if (node.type === 'paragraph') {
      return (
        <p key={key}>
          {node.children?.map((child: any, index: number) =>
            renderLexicalNode(child, index)
          )}
        </p>
      )
    }

    // Handle heading nodes
    if (node.type === 'heading') {
      const level = node.tag?.replace('h', '') || '2'
      const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements
      return (
        <HeadingTag key={key}>
          {node.children?.map((child: any, index: number) =>
            renderLexicalNode(child, index)
          )}
        </HeadingTag>
      )
    }

    // Handle list nodes
    if (node.type === 'list') {
      const ListTag = node.listType === 'number' ? 'ol' : 'ul'
      return (
        <ListTag key={key}>
          {node.children?.map((child: any, index: number) => (
            <li key={index}>
              {child.children?.map((grandchild: any, grandchildIndex: number) =>
                renderLexicalNode(grandchild, grandchildIndex)
              )}
            </li>
          ))}
        </ListTag>
      )
    }

    // Handle quote/blockquote nodes
    if (node.type === 'quote') {
      return (
        <blockquote key={key}>
          {node.children?.map((child: any, index: number) =>
            renderLexicalNode(child, index)
          )}
        </blockquote>
      )
    }

    // Fallback: render children if they exist
    if (node.children && Array.isArray(node.children)) {
      return (
        <div key={key}>
          {node.children.map((child: any, index: number) =>
            renderLexicalNode(child, index)
          )}
        </div>
      )
    }

    return node.text || null
  }

  // Function to render rich text content
  const renderContent = (content: any) => {
    if (!content) return <p>No content available</p>

    // If content is a string (HTML)
    if (typeof content === 'string') {
      return <div dangerouslySetInnerHTML={{ __html: content }} />
    }

    // If content is Lexical format (object with root)
    if (typeof content === 'object' && content.root) {
      return (
        <div>
          {content.root.children?.map((node: any, index: number) =>
            renderLexicalNode(node, index)
          )}
        </div>
      )
    }

    // If content is Payload's rich text format (array of blocks)
    if (Array.isArray(content)) {
      return (
        <div>
          {content.map((block: any, index: number) =>
            renderLexicalNode(block, index)
          )}
        </div>
      )
    }

    return <p>Content format not recognized</p>
  }

  return (
    <div className="page-container">
      <div className="home">
        <div className="content">
          {/* Header Section */}
          <header className="page-header">
          </header>

          {/* Blog Post Section */}
          <section className="blog-section">
            {post ? (
              <article className="blog-post">
                <h2>{post.title}</h2>

                {post.featuredImage && typeof post.featuredImage === 'object' && (
                  <div className="featured-image">
                    <Image
                      src={post.featuredImage.url || '/fallback-image.png'}
                      alt={post.featuredImage.alt || post.title}
                      width={800}
                      height={400}
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}

                <div className="post-meta">
                  <span className="author">
                    By {typeof post.author === 'object' ? post.author.email : 'Unknown Author'}
                  </span>
                  <span className="date">
                    {new Date(post.publishedDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="post-content">
                  {renderContent(post.content)}
                </div>
              </article>
            ) : (
              <div className="no-posts">
                <p>Welcome to the demo application!</p>
                <p>This application demonstrates:</p>
                <ul style={{ textAlign: 'left', marginTop: '1rem' }}>
                  <li>Real-time chat using WebSockets</li>
                  <li>OCR document processing with Azure AI</li>
                  <li>Microservices architecture with Kubernetes</li>
                  <li>PayloadCMS for content management</li>
                </ul>
              </div>
            )}
          </section>

          {/* Applications Section */}
          <section className="applications">
            <h2>Our Applications</h2>
            <div className="app-grid">
              <div className="app-container">
                <h3>Real-time Chat</h3>
                <iframe
                  src={chatUrl}
                  title="Chat Application"
                  className="app-iframe"
                  allowFullScreen
                />
              </div>

              <div className="app-container">
                <h3>OCR Document Processing</h3>
                <iframe
                  src={aiUrl}
                  title="OCR Application"
                  className="app-iframe"
                  allowFullScreen
                />
              </div>
            </div>
          </section>

          <footer className="page-footer">
            <p>&copy; 2025 - Tema STD - TATAR IOAN-DAN</p>
          </footer>
        </div>
      </div>
    </div>
  )
}