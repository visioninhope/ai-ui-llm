# AI UI

A pretty nice UI for AI. Still very much a work in progress.

> **Alert:** There is no DB files in this repo. You need to set up a supabase instance manually if you want to use this. I will fix this soon.

![alt](gif.gif)

## Features

- Artifacts (Like Anthropic's Claude)
- Image/Text upload
- Support for multiple models
- Support for local models

## Getting Started

### Prerequisites

- Node.js
- Yarn
- Free supabase account

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/ai-ui.git
   cd ai-ui
   ```

2. Install dependencies:

   ```bash

   yarn install

   ```

3. Set up environment variables:
   Create an `.env.local` file in the `packages/ui/` directory and add the  artifact renderer url, supabase information, and any other environmental variables you need. You need at least one api key or you can use can configure a local api in the UI.

4. Run the development server. in the ROOT directory run:

   ```bash

   yarn dev

   ```

   This will start both the UI and the artifact renderer server.

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application. Yarn dev should also start the artifact renderer server in the background. If not, run `yarn dev` in the `artifacts` directory.

## Roadmap

- [ ] Support for more models
- [ ] File format handling for non text files
- [ ] Auth
- [ ] Avatar Upload / Bucket Setup
- [ ] Tool Calling? -Maybe.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the [MIT License](LICENSE).
