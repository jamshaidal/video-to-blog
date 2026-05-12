# AI Video-to-Blog Platform

An AI-powered media processing platform that converts uploaded videos into structured written content such as blog posts, scripts, captions, and descriptions.

## Project Overview

This project demonstrates applied AI engineering: combining video processing, transcription, content generation, job queues, storage, authentication, and a modern web interface into one production-style system.

## AI/ML Relevance

The platform is part of my applied AI portfolio because it shows how machine learning services can be integrated into real user workflows.

Key AI workflow:

1. User uploads a video
2. Backend stores the media file
3. Worker extracts audio with FFmpeg
4. AI transcription converts speech to text
5. Generative AI creates structured content from the transcript
6. Frontend displays generated outputs for download and reuse

## Tech Stack

- Frontend: Next.js
- Backend: Express.js
- Database: PostgreSQL with Prisma
- Queue: Redis and BullMQ
- Storage: S3-compatible object storage
- Media processing: FFmpeg
- AI services: transcription and content generation
- Deployment: Docker, Vercel, and Render-oriented architecture

## Engineering Skills Demonstrated

- Full-stack AI application architecture
- Asynchronous worker queues for long-running AI jobs
- API authentication and upload validation
- Database modeling for users, jobs, and generated results
- Production-style deployment planning
- Integration of AI APIs into a real product workflow

## Research Connection

While this is an applied product, the same architecture can support AI/ML research pipelines for media analysis, dataset preparation, transcription, annotation, and experiment output generation.

## Author

Muhammad Jamshaid Ali

AI researcher and ML engineer focused on deepfake detection, federated learning, and applied AI systems.
