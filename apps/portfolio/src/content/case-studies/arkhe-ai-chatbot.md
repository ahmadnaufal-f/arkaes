---
title: "Designing Arkhe, a retrieval augmented AI assistant for my portfolio"
shortDesc: "Built a framework agnostic AI assistant powered by RAG, Supabase pgvector, and streaming responses to create an interactive portfolio experience."
projectName: "Arkhe AI Chatbot"
order: 5
featured: true
visual: "arkhe-ai-chatbot"
category: "side-project"
tags:
  - TypeScript
  - OpenAI
  - RAG
  - Supabase
  - pgvector
  - AI
---

## Overview

Arkhe is the AI assistant integrated into my personal portfolio, allowing visitors to ask natural language questions about my experience, projects, technical decisions, and engineering approach. Instead of navigating multiple pages, users can interact with the portfolio conversationally while receiving answers grounded in my own work.

The project evolved beyond a simple chatbot into a complete Retrieval Augmented Generation (RAG) system. I designed both the ingestion pipeline that prepares portfolio knowledge and the runtime architecture that retrieves relevant context, constructs prompts, streams responses, and returns cited sources.

The entire solution was built as a reusable package with clear client and server boundaries, making it portable across different web frameworks while keeping AI credentials securely on the server.

## Project context

Traditional portfolio websites require visitors to browse pages manually and assemble information themselves. Recruiters and engineers often have highly specific questions that span multiple projects.

I wanted to provide a more natural experience while ensuring every answer remained factual and traceable to my own content. Achieving this required much more than connecting an LLM API. It required designing a reliable knowledge retrieval pipeline, prompt orchestration, streaming infrastructure, and citation system.

## My role

I independently designed and implemented the complete system, including:

- Overall AI architecture
- RAG pipeline
- Document ingestion workflow
- Supabase pgvector integration
- Prompt engineering strategy
- Streaming response pipeline
- Citation generation
- Client and server package architecture
- Frontend chatbot integration

## The problem

General-purpose language models know nothing about private portfolio content. Without additional context they either hallucinate or answer with generic information.

Injecting the entire portfolio into every prompt would also increase latency, token usage, and cost while reducing relevance.

The challenge was building an architecture that retrieves only the most relevant knowledge for each request while remaining secure, scalable, and maintainable.

## Goals

- Build an AI powered portfolio assistant.
- Keep responses grounded in my own knowledge base.
- Support low latency streaming.
- Design reusable architecture.
- Separate browser and server responsibilities.
- Allow the knowledge base to evolve independently.
- Provide transparent source citations.
- Fail gracefully when retrieval becomes unavailable.

## Architecture

The system consists of two independent pipelines.

The ingestion pipeline prepares portfolio documents by chunking content, generating embeddings, and storing vectors in Supabase pgvector.

The runtime pipeline validates requests, retrieves relevant chunks, builds prompts, streams model responses, and returns only the cited sources to the frontend.

![Two pipelines sharing one Supabase pgvector store — ingestion writes embedded chunks offline, and the runtime reads the nearest neighbours for each question](/case-studies/arkhe-ai-chatbot/architecture.svg)

## Technical decisions

### Framework agnostic request handler

The server exposes a Request → Response handler instead of depending on framework-specific APIs, making deployment portable.

### Retrieval Augmented Generation

Portfolio documents are split into semantic chunks, embedded with OpenAI, and stored in Supabase pgvector. Every incoming question is embedded and matched using vector similarity search before prompt construction.

### Prompt layering

A stable system persona is separated from dynamic developer instructions and retrieved knowledge. This improves maintainability while allowing stable instructions to remain cache friendly.

### Graceful degradation

When vector retrieval fails, Arkhe falls back to a curated knowledge base instead of failing completely.

### Streaming responses

Responses are streamed token by token for faster perceived performance.

### Automatic citations

Retrieved documents receive numbered citations before prompt construction. Only citations actually referenced by the generated answer are returned to the UI.

## Implementation

The chatbot was designed as reusable client and server packages. The browser only renders the chat interface while all OpenAI communication, embeddings, retrieval, and prompt orchestration remain on the server.

During ingestion, portfolio documents are chunked while preserving paragraph boundaries where possible. Embeddings are generated using OpenAI's embedding model and stored in Supabase.

At runtime, the latest user message is embedded, matched against the vector database, combined with persona instructions and curated portfolio knowledge, then sent to the language model. The streamed response is returned together with machine-readable citations.

![The layered prompt feeding the model, and the citation round-trip — sources go in numbered, and only the ones the answer actually cites are returned to the interface](/case-studies/arkhe-ai-chatbot/prompt-and-citations.svg)

## Results

- Interactive conversational portfolio
- RAG grounded responses
- Streaming AI responses
- Framework agnostic server architecture
- Reusable chatbot package
- Automatic citations
- Graceful fallback strategy
- Clear separation between frontend and backend AI responsibilities

## What I learned

This project reinforced that high quality AI applications depend on system architecture rather than prompt engineering alone.

Preparing knowledge, retrieving relevant context, separating responsibilities, and designing resilient fallback mechanisms have a much greater influence on answer quality than simply choosing a stronger language model.

It also gave me practical experience designing production-style AI systems that balance maintainability, security, performance, and developer experience.
