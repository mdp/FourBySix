# FourBySix Label Printer

A web-based label printing application built with React, TypeScript, and Vite. This tool allows you to create and customize labels for 4x6 inch sheets, perfect for organizing, labeling, or any printing needs.

## Features

- **Customizable Grid Layout**: Set up to 6x6 grid (36 labels max) on a 4x6 inch sheet
- **Orientation Support**: Portrait (normal) or Landscape (rotated 90°) printing
- **Text Customization**:
  - Adjustable font size (auto-calculated for best fit)
  - Text alignment (left, center, right)
  - Multi-line text support
- **Border Styles**: No border, thick line, or rounded corners
- **Bulk Editing**: Apply the same text to all labels at once
- **Print-Ready**: Optimized for browser printing with proper margins and spacing

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mdp/FourBySix.git
   cd FourBySix
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

The built files will be in the `dist` directory.

## Usage

1. **Set Grid Layout**: Choose the number of rows and columns (1-6 each)
2. **Configure Options**:
   - Select orientation (Portrait/Landscape)
   - Choose text alignment
   - Pick border style
3. **Edit Labels**: Click on any label to edit its text
4. **Bulk Edit**: Use the bulk edit textarea to apply text to all labels
5. **Print**: Click "Print Labels" and use your browser's print dialog

## Technical Details

- Built with React 19 and TypeScript
- Uses Vite for fast development and building
- Responsive design with CSS Grid
- Automatic font sizing based on text content and label dimensions
- Print-optimized CSS with `@media print` rules

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and not licensed for public use.

## Technologies Used

- **Frontend**: React, TypeScript
- **Build Tool**: Vite
- **Styling**: CSS
- **Linting**: ESLint with TypeScript support
