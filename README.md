# Sruthi Kamath — Multimodal Fusion Dashboard

A presentation dashboard showing how CBC / clinical features can be combined with peripheral smear image features to classify a platelet case into one of four groups:

`Normal | Hypoproductive | Hyperdestructive | Pseudothrombocytopenia`

It uses a dark "Night Lab" theme with a blood-cell background, and runs fully offline.

## Download

Grab everything in one go from [`Sruthi_Kamath_project.zip`](Sruthi_Kamath_project.zip) (open it, then click **Download raw file**), or use **Code → Download ZIP** at the top of this page. Unzip it and open the folder.

## Running it

**Option 1 — just open it in a browser (no install needed)**

Open `dashboard.html` in Chrome, Edge or Firefox. All the code, data and images are bundled inside the file, so it works without Python or an internet connection. On Windows you can also double-click `Open_Dashboard.bat`.

**Option 2 — Streamlit**

The run command is also at the top of `app.py`, so you can copy it from there. Open a terminal in the project folder and run:

```bash
python3 -m pip install -r requirements.txt && python3 -m streamlit run app.py
```

On Windows, if Python is installed as `python`:

```bash
python -m pip install -r requirements.txt && python -m streamlit run app.py
```

Or double-click `Run_Streamlit.bat` after installing the requirements. `app.py` carries its own embedded copy of the dashboard, so it only needs Streamlit to run.

## Project structure

```
app.py                  Streamlit version (self-contained)
dashboard.html          Browser version (self-contained, works offline)
rebuild.py              Rebuilds dashboard.html and app.py from src/ and assets/
requirements.txt
Open_Dashboard.bat      Opens dashboard.html on Windows
Run_Streamlit.bat       Starts the Streamlit app on Windows
src/
  dashboard.template.html   Page layout
  dashboard.css             Styling, theme and responsive layout
  dashboard.js              Interactions, image upload, quality check, scenarios
  demo-data.json            Case values, probabilities, contributions, regions
assets/                 Case images, background, crops and reference images
```

## Pages

Navigation is a sidebar on desktop and a scrollable bar on smaller screens. Sample info is collapsed into a single line — click `Patient details` to see Patient ID, Age, Sex, Sample/Test ID and Date of Analysis.

| Page | What you see | Expandable details |
| --- | --- | --- |
| Overview | Large smear image, predicted class and confidence, MPV / PDW / LCR | Links to the images and the result |
| Platelet indices | Three cards with reference ranges and visual gauges | Short clinical note; each index has its own scale |
| CBC profile | Chart of nine CBC values plus a PLT / PCT summary | Full CBC table with all 19 values and PLT |
| Smear images | Original and processed image side by side, image upload, highlighted regions | Image quality panel and detection reference gallery |
| Morphometry | Six shape measurements, size distribution, morphology and clumping notes | Side-by-side comparison of the four scenarios |
| Prediction | Predicted class, confidence, probabilities for all four classes, short explanation | Clinical and image evidence |
| Fusion model | CBC branch, image branch, fusion layer and the four output classes | The current sample image is shown inside the image branch |
| Explainability | Clinical contribution scores and region crops | Clinical findings and image findings |

The Normal / Hypoproductive / Hyperdestructive / Pseudothrombocytopenia buttons on the Fusion model page switch the active scenario and update the image, CBC values and result on every page. The case can also be switched from the top menu.

The core indices are MPV, PDW and LCR. The CBC chart covers WBC, RBC, HGB, HCT, MCV, MCH, MCHC, RDW and PCT, and marks where each value sits within its range. The six morphometric measures are Area, Perimeter, Equivalent Diameter, Circularity, Aspect Ratio and Eccentricity. Contribution scores are illustrative — they are not SHAP values, and there are no assumed 50/50 fusion weights.

## Image upload and quality check

Uploaded images are processed in the browser and never sent to a server. JPG and PNG are accepted (checked by file signature and a successful decode), up to 10 MB and 16 megapixels.

The quality check reports image size, a focus estimate (Laplacian variance, computed on a copy scaled to 384 px on the long side), mean brightness and grayscale contrast. If resolution, focus, brightness or contrast fall outside fixed thresholds, the dashboard shows `Review recommended`. This is a basic technical check, not a diagnostic quality assessment.

Processing applies a linear contrast boost of 1.16 around 128, keeps the aspect ratio, and caps the processed preview at 1400 px on the long side. The original image is kept unchanged.

For an uploaded image, no bounding boxes, clumps, crops, µm measurements or predictions are shown as real results. `Run demo analysis` shows the available processing and explains that no model inference runs. `View selected demo result` shows the selected scenario's result, clearly marked as not belonging to the uploaded image. Changing the case or pressing Reset brings back the reference case.

## Data and limitations

The core values, supporting CBC, probabilities, contribution scores, platelet / clump counts, size distribution and five of the morphometric measures come from the original demo scenarios. Analyzer PLT values of 255, 75, 65 and 80 ×10³/µL were added for the four cases respectively.

Perimeter is derived from Area and Circularity using `sqrt(4 × pi × area / circularity)`. There is no real pixel-to-µm calibration, and the measurements are not extracted from the images. CBC ranges are the ones used in the original demo and may differ from other analyzers or labs.

The 20 highlighted regions were picked by hand for the demo and are not model detections; their number is independent of the overall counts. The three clump regions belong to the Pseudothrombocytopenia reference. The reference images and their assignment to cases are illustrative and do not represent confirmed diagnoses. The Hypoproductive image and the background are generated and labelled as such; all other images come from the original material. The three detection images belong to a separate example.

There is no trained model or inference service connected. Class results are fixed per scenario and are not inferred from the platelet count alone or from an uploaded image. To plug in a real model later, replace the scenario data with the service response combining CBC data and image results, along with where the measurements, probabilities and regions came from.

## Editing

After changing anything in `src/` or `assets/`, rebuild the bundled files:

```bash
python3 rebuild.py
```

This regenerates `dashboard.html` and the embedded copy inside `app.py` (standard library only, no extra packages).

Tips: click an image or the Enlarge button to zoom, use the arrow keys to move between tabs, and switch the browser to full screen for presentations.
