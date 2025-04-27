# MetaLens: EXIF Metadata Viewer

MetaLens is a sleek web application designed to reveal the hidden EXIF (Exchangeable Image File Format) metadata embedded within your digital images. Upload a photo and instantly uncover details about the camera, settings, location, and more.

**Live Demo:** [https://metalenss.vercel.app](https://metalenss.vercel.app)

## What it Does

Most digital cameras and smartphones automatically embed technical details into the image files they create. This EXIF metadata can include camera make/model, settings like ISO, aperture, and shutter speed, the date and time the photo was taken, software used for editing, and sometimes even GPS coordinates. MetaLens provides a simple and elegant interface to upload an image and view this often-unseen data.

## Key Features

*   **Easy Upload:** Supports drag-and-drop or traditional file selection for image uploads.
*   **Image Preview:** Shows a thumbnail of the uploaded image.
*   **EXIF Data Extraction:** Quickly parses and displays metadata using the `exifreader` library.
*   **Categorized View:** Metadata is presented in easy-to-read cards grouped by category (e.g., Image, Camera, GPS).
*   **Metadata Search:** Filter the displayed metadata cards using keywords to find specific information quickly.
*   **Responsive Design:** Looks and works great on desktops, tablets, and mobile devices.
*   **Modern UI:** Features a "glassmorphism" aesthetic with smooth animations (fade-in on scroll via AOS, 3D tilt effect on cards via Vanilla Tilt).

## How it Works

*   **Backend:** A Node.js server built with Express handles image uploads using Multer.
*   **EXIF Parsing:** The core metadata extraction is performed on the server using the `exifreader` JavaScript library.
*   **Frontend:** The user interface is rendered using EJS templates, styled with CSS, and made interactive with vanilla JavaScript, AOS, and Vanilla Tilt.