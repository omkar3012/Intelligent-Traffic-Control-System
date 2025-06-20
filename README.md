# Intelligent Traffic Control System 🚦

![Intelligent Traffic Control System Demo](<./images/down/1.jpeg>)

An AI-powered Intelligent Traffic Control System with real-time vehicle detection, adaptive signal timing, and a dynamic Next.js frontend. This project simulates a modern traffic management solution, using computer vision to optimize traffic flow and provide analytics.

## ✨ Features

-   **Multi-Lane Traffic Analysis**: Upload video files for multiple intersection lanes to simulate a real-world scenario.
-   **AI-Powered Vehicle Detection**: A Python backend script uses OpenCV to detect and count vehicles in traffic videos.
-   **Adaptive Signal Timing**: An exponential algorithm dynamically calculates optimal green light durations based on real-time traffic density.
-   **Interactive Intersection Animation**: A beautiful and responsive animation visualizes the traffic flow, with real-time signal changes, countdowns, and progress bars.
-   **Customizable Simulation Speed**: Control the speed of the animation (1x, 2x, 4x) for better analysis.
-   **Live Analytics**: View key metrics like vehicle counts, traffic intensity, and system efficiency.
-   **Modern Tech Stack**: Built with Next.js for the frontend and a Python serverless function for the backend.
-   **Ready for Deployment**: Fully configured for easy deployment on Vercel.

## 🛠️ Technologies Used

-   **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Framer Motion, Chart.js
-   **Backend**: Python, OpenCV (for vehicle detection)
-   **Platform**: Vercel (for deployment)
-   **API**: Next.js API Routes (Serverless Functions)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](httpss://nodejs.org/en/) (v18 or later)
-   [Python](httpss://www.python.org/downloads/) (v3.10 recommended)
-   `venv` for creating a virtual environment

### Local Setup

1.  **Clone the repository:**
   ```bash
    git clone https://github.com/OMKAR2003/Intelligent-Traffic-Control-System.git
    cd Intelligent-Traffic-Control-System
    ```

2.  **Download the Model Weights:**
    -   Go to the [**Releases**](https://github.com/OMKAR2003/Intelligent-Traffic-Control-System/releases) page of this repository.
    -   Download the `yolov2.weights` file from the latest release.
    -   Create a `bin` folder in the root of the project and place the downloaded `yolov2.weights` file inside it. The final path should be `./bin/yolov2.weights`.

3.  **Set up the Python environment:**
   ```bash
    # Create and activate a virtual environment
    python -m venv venv310
    source venv310/bin/activate  # On Windows, use `venv310\Scripts\activate`

    # Install Python dependencies
   pip install -r requirements.txt
   ```

4.  **Install frontend dependencies:**
   ```bash
    npm install
    ```

5.  **Run the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🌐 Deployment

This project is optimized for deployment on **Vercel**. For detailed, step-by-step instructions, please see the [DEPLOYMENT.md](DEPLOYMENT.md) file.

## 📂 Project Structure

```
/
├── app/                  # Next.js 13 app directory
│   ├── api/              # API routes (including Python backend)
│   ├── (components)/     # Global layout and pages
│   └── ...
├── components/           # React components
├── public/               # Public assets
├── styles/               # Global styles
├── vehicle_detection_simple.py # Python script for vehicle detection
├── requirements.txt      # Python dependencies
├── package.json          # Node.js dependencies
└── vercel.json           # Vercel deployment configuration
```

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

