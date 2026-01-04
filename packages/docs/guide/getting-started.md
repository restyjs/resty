# Getting Started

## Introduction

Resty.js is a modern, opinionated web framework for Node.js built on top of Express and TypeScript. It leverages decorators and dependency injection to provide a scalable and testable architecture.

## Installation

```bash
npm install @restyjs/core reflect-metadata typedi
```

## Basic Usage

```typescript
import "reflect-metadata";
import { resty, Controller, Get } from "@restyjs/core";

@Controller("/")
class HelloController {
  @Get("/")
  index() {
    return "Hello World";
  }
}

const app = resty({
  controllers: [HelloController]
});

app.listen(3000);
```
