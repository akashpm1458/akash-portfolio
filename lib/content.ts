// =============================================================================
// ALL site text and data lives here. Edit this file to update the website.
// Leave a URL as "" to hide that link everywhere.
// =============================================================================

export const person = {
  name: "Akash Prakasan Manikyam",
  firstName: "Akash",
  initial: "A.",
  role: "Radar Signal Processing & State Estimation",
  email: "prakasanmanikyam@outlook.com",
  location: "Erlangen, Germany",
  cvUrl: "", // add public/akash-cv.pdf, then set this to "/akash-cv.pdf"
  siteTagline: "Built in Erlangen.",
};

export type SocialName = "LinkedIn" | "GitHub";
export const socials: { name: SocialName; url: string }[] = [
  { name: "LinkedIn", url: "" }, // TODO add your LinkedIn URL
  { name: "GitHub", url: "https://github.com/akashpm1458" },
];
export const activeSocials = socials.filter((s) => s.url);

export const hero = {
  lines: ["PERCEPTION", "ENGINEER"],
  ariaLabel: "Perception Engineer",
  year: "©2026",
  focus: "/RADAR SIGNAL PROCESSING & STATE ESTIMATION",
};

export const bio = {
  role: ["Radar Signal Processing", "& State Estimation."],
  current: {
    org: "FAU Erlangen-Nürnberg",
    title: "M.Sc. Electromobility, AI & Autonomous Driving",
    place: "Erlangen, Germany",
  },
  // text segments: [plain, bold, plain, bold, plain]
  lead: [
    "I turn raw ",
    "77 GHz radar data",
    " into usable detections and fuse ",
    "IMU, GNSS and LiDAR",
    " into reliable vehicle state estimates.",
  ],
};

export const skills = [
  {
    id: "skills-radar",
    title: "Radar & Signal Processing",
    note: "FMCW Radar, Detection & Clustering, SAR Imaging",
    items: [
      "FMCW Radar", "TDM-MIMO", "CA-CFAR", "DBSCAN", "CZT",
      "Range-Doppler Processing", "SAR Backprojection", "Interference Mitigation", "Ego-Motion Estimation",
    ],
  },
  {
    id: "skills-estimation",
    title: "State Estimation & AI",
    note: "Sensor Fusion, Kalman Filtering, Deep Learning",
    items: [
      "Kalman Filtering", "Error-State KF", "Sensor Fusion", "IMU / GNSS / LiDAR", "Testing & Validation",
      "PyTorch", "YOLOv11", "Model Predictive Control", "Pattern Recognition",
    ],
  },
  {
    id: "skills-tools",
    title: "Languages & Tools",
    note: "Prototyping, GPU Acceleration, Tooling",
    items: ["Python", "MATLAB", "Simulink", "C++", "CUDA", "ROS2", "Git", "Docker", "Linux"],
  },
];

// ---------- Projects ----------
export type FolderKind = "case-study" | "project";
export type Folder = {
  id: string;
  title: string;
  category: string;
  action: string;
  kind: FolderKind;
  image?: string;
  backLabel: string;
  frontLabel: string;
};

export const folders: Folder[] = [
  {
    id: "sar-thesis", title: "SAR Autofocus", category: "Project thesis · Case study",
    action: "Read case study", kind: "case-study",
    backLabel: "Case study overview", frontLabel: "Chain, method & validation",
  },
  {
    id: "eskf", title: "ESKF Localization", category: "Multi-sensor state estimation",
    action: "View project", kind: "project", image: "/eskf.png",
    backLabel: "Project overview", frontLabel: "Details & source",
  },
  {
    id: "radar-interference", title: "Radar Interference", category: "77 GHz interference mitigation",
    action: "View project", kind: "project", image: "/radar-interference.png",
    backLabel: "Project overview", frontLabel: "Details & source",
  },
  {
    id: "kitti-perception", title: "KITTI Perception", category: "Detection with depth",
    action: "View project", kind: "project", image: "/kitti-perception.png",
    backLabel: "Project overview", frontLabel: "Details & source",
  },
];

export const caseStudy = {
  id: "sar-thesis",
  preview: { top: "Lehrstuhl für Hochfrequenztechnik", big: ["From raw radar", "to sharp SAR."], bottom: "Project thesis · Grade 1.3" },
  toolbar: "Thesis case study",
  title: "Automated GCP Selection for SAR Autofocus",
  category: "Lehrstuhl für Hochfrequenztechnik, FAU · Project thesis",
  summary:
    "An automated signal processing chain that picks reliable ground control points from automotive radar images, so SAR autofocus no longer depends on manual selection.",
  facts: [
    ["Role", "Project thesis student"],
    ["Period", "06/2025 – 05/2026"],
    ["Stack", "MATLAB · CUDA C++ (MEX)"],
    ["Data", "77 GHz FMCW TDM-MIMO, institute test vehicle"],
    ["Grade", "1.3"],
  ],
  note: "Measurement data belongs to the Lehrstuhl für Hochfrequenztechnik. Figures shown are illustrative.",
  challenge:
    "SAR autofocus needs ground control points: strong, stable radar targets. Picking them by hand on range-angle images is slow and inconsistent, and the motion estimate behind the SAR image has to be accurate for the focus to work.",
  steps: [
    ["Detect candidates", "Ran CA-CFAR detection on 77 GHz range-angle images and grouped detections with DBSCAN clustering."],
    ["Refine and select", "Sharpened candidate peaks with CZT spectral refinement and kept targets that matched the expected point spread function."],
    ["Estimate motion from radar alone", "Estimated coarse ego motion from the Doppler-azimuth profile of static targets, then refined velocity using residual phase errors of the selected GCPs."],
    ["Accelerate and validate", "Implemented GPU-accelerated SAR backprojection as a CUDA C++ MEX kernel and validated the chain with a phase coherency factor on real drives, against camera and odometry references."],
  ],
  impact:
    "GCP selection went from a manual step to a fully automated chain, validated on real measurement sequences from the institute's test vehicle.",
  before: ["Before · GCP selection", "Manual"],
  after: ["After · GCP selection", "Automated"],
  estimate: "Validated with a phase coherency factor against camera and odometry references.",
};

export type Study = {
  id: string;
  title: string;
  category: string;
  summaryLabel: string;
  description: string;
  stack: string[];
  metric?: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  imageBg: string;
  imageAlt: string;
  imageHref?: string;
  imageLinkLabel?: string;
  links: { label: string; href: string; icon: "source" | "demo" | "live" }[];
  details: string[];
};

const eskfRepo = "https://github.com/akashpm1458/vehicle-localization-eskf";

export const eskf: Study & {
  diagram: {
    title: string; groupLabel: string;
    input: string; routerTitle: string; routerSub: string;
    a: { key: string; button: string; title: string; sub: string; explain: string };
    b: { key: string; button: string; title: string; sub: string; explain: string };
  };
} = {
  id: "eskf",
  title: "ESKF Localization",
  category: "Multi-sensor state estimation",
  summaryLabel: "Inside the filter",
  description:
    "Vehicle state estimation with 9 and 15 state error-state Kalman filters fusing IMU, GNSS and LiDAR in Python.",
  stack: ["Python", "NumPy", "Error-State KF", "IMU", "GNSS", "LiDAR"],
  metric: "0.096 m position RMSE",
  image: "/eskf.png", imageWidth: 1600, imageHeight: 1000, imageBg: "#d1d2cf",
  imageAlt: "ESKF localization result plot",
  imageHref: eskfRepo, imageLinkLabel: "View ESKF source",
  links: [{ label: "Source", href: eskfRepo, icon: "source" }],
  details: [
    "Implemented and compared 9 and 15 state error-state Kalman filters fusing IMU, GNSS and LiDAR for vehicle state estimation.",
    "Stress tests: sensor dropouts, degraded GNSS and injected measurement outliers.",
    "Failure analysis: investigated a mode where gating rejected valid GNSS measurements after prolonged degradation.",
    "Period: 01/2026 – 05/2026.",
  ],
  diagram: {
    title: "Filter walkthrough",
    groupLabel: "Compare filter variants",
    input: "IMU prediction · GNSS + LiDAR updates",
    routerTitle: "Error-State KF",
    routerSub: "Predict on IMU, correct on fixes",
    a: { key: "9", button: "9-state", title: "9-state filter", sub: "Position, velocity, attitude",
      explain: "The compact filter tracks pose and velocity only and leans on frequent GNSS fixes." },
    b: { key: "15", button: "15-state", title: "15-state filter", sub: "+ accelerometer & gyro biases",
      explain: "Bias states let the filter keep drift in check during GNSS dropouts and degraded fixes." },
  },
};

export const studies: Study[] = [
  {
    id: "radar-interference",
    title: "Radar Interference Mitigation",
    category: "77 GHz interference mitigation",
    summaryLabel: "Project details",
    description:
      "A 77 GHz PC-FMCW radar simulation that suppresses interference from other radars using phase coding.",
    stack: ["MATLAB", "PC-FMCW", "GMSK", "Range-Doppler"], // TODO confirm MATLAB
    metric: "Interference power spread across the range-Doppler profile",
    image: "/radar-interference.png", imageWidth: 1600, imageHeight: 900, imageBg: "#d5d1e0",
    imageAlt: "Range-Doppler map of the interference simulation",
    links: [],
    details: [
      "Implemented GMSK fast-time and slow-time phase coding with phase lag compensation and group delay filtering.",
      "Simulated coherent narrowband, coherent wideband and non-coherent wideband interference against conventional FMCW.",
      "Period: 06/2025 – 12/2025.",
    ],
  },
  {
    id: "kitti-perception",
    title: "KITTI Perception",
    category: "Detection with depth",
    summaryLabel: "Project details",
    description:
      "YOLOv11 object detection on the KITTI dataset, combined with MiDaS monocular depth estimation.",
    stack: ["Python", "PyTorch", "YOLOv11", "MiDaS", "KITTI"],
    // metric: "TODO e.g. mAP@0.5 on KITTI val",
    image: "/kitti-perception.png", imageWidth: 1600, imageHeight: 800, imageBg: "#c7cdc7",
    imageAlt: "Object detection frame with depth overlay",
    links: [],
    details: ["Combines 2D detections with per-pixel monocular depth to estimate how far each detected object is."],
  },
];

// ---------- Experience ----------
export const journey = [
  {
    id: "msc", cls: "journey-now", pill: "Current", date: "10/2022 – Present",
    title: ["M.Sc. Electromobility"], place: "FAU Erlangen-Nürnberg", sub: "Erlangen",
    description: "Major in AI & Autonomous Driving. Numerical Optimization & MPC, Robotics Frameworks, Pattern Recognition, Deep Learning.",
  },
  {
    id: "thesis", cls: "journey-thesis", pill: "Grade 1.3", date: "06/2025 – 05/2026",
    title: ["Project Thesis"], place: "Lehrstuhl für Hochfrequenztechnik", sub: "FAU Erlangen",
    description: "Automated radar-based GCP selection for SAR autofocus on 77 GHz FMCW data.",
  },
  {
    id: "work", cls: "journey-work", pill: "", date: "10/2020 – 11/2021",
    title: ["Production Executive"], place: "Fabbri Foods Pvt Ltd", sub: "Kozhikode, India",
    description: "Enforced quality control standards, analyzed production data to optimize workflows and prepared reports for management reviews.",
  },
  {
    id: "bachelor", cls: "journey-bachelor", pill: "", date: "04/2015 – 05/2020",
    title: ["B.Tech Mechanical", "Engineering"], place: "APJ Abdul Kalam Technological University", sub: "India",
    description: "Design of Machine Elements, Kinematics of Machines, Manufacturing Processes.",
  },
];

export const contact = {
  blurb: "Open to working student, internship and thesis roles in radar, sensor fusion and perception. My inbox is open.",
  messagePlaceholder: "A little about the role or project…",
};

// Source for the faint code wall behind the hero (also good context for the chatbot)
export const heroCode = `const akash = {
  name: "${person.name}",
  role: "${person.role}",
  focus: ["Radar signal processing", "Sensor fusion", "State estimation"],
  study: { degree: "M.Sc. Electromobility", major: "AI & Autonomous Driving",
    university: "FAU Erlangen-Nürnberg", since: "10/2022", status: "Current" },
  thesis: { title: "Automated Radar-Based GCP Selection for SAR Autofocus",
    lab: "Lehrstuhl für Hochfrequenztechnik", grade: 1.3,
    chain: ["CA-CFAR", "DBSCAN", "CZT", "PSF correlation", "CUDA backprojection"] },
  experience: [
    { role: "Production Executive", company: "Fabbri Foods Pvt Ltd",
      city: "Kozhikode", period: "10/2020 – 11/2021" }
  ],
  education: [
    { degree: "B.Tech Mechanical Engineering",
      university: "APJ Abdul Kalam Technological University", period: "2015 – 2020" }
  ],
  projects: {
    ESKF: "9 vs 15 state error-state Kalman filters, 0.096 m RMSE",
    RadarInterference: "77 GHz PC-FMCW with GMSK phase coding",
    KITTI: "YOLOv11 detection with MiDaS depth"
  },
  skills: {
    radar: ["FMCW", "TDM-MIMO", "CA-CFAR", "DBSCAN", "CZT", "SAR"],
    estimation: ["Kalman filtering", "ESKF", "Sensor fusion", "IMU", "GNSS", "LiDAR"],
    tools: ["Python", "MATLAB", "Simulink", "C++", "CUDA", "PyTorch",
      "Git", "Docker", "Linux"]
  },
  languages: { English: "C1", German: "A2" },
  hobbies: ["5 km personal bests", "Basketball", "Hiking"],
  email: "${person.email}",
  github: "https://github.com/akashpm1458"
};

export default function Portfolio() {
  return <main>
    <header><h1>{akash.name}</h1><p>{akash.role}</p></header>
    <section><h2>Thesis</h2>
      <article><h3>{akash.thesis.title}</h3><p>{akash.thesis.lab}</p>
        <small>Grade {akash.thesis.grade}</small></article>
    </section>
    <section><h2>Projects</h2>
      {Object.entries(akash.projects).map(([name, detail]) =>
        <article key={name}><h3>{name}</h3><p>{detail}</p></article>)}
    </section>
    <section><h2>Tech Stack</h2>
      {Object.entries(akash.skills).map(([group, tools]) =>
        <div key={group}><h3>{group}</h3><p>{tools.join(", ")}</p></div>)}
    </section>
    <footer><a href={"mailto:" + akash.email}>Let's talk.</a></footer>
  </main>;
}`;

// Extra facts only the chatbot uses
export const chatProfile = {
  ...person,
  languages: { English: "C1, full professional proficiency", German: "A2, actively improving" },
  hobbies: ["Chasing 5 km personal bests", "Basketball", "Hiking"],
  education: [
    "M.Sc. Electromobility (Major: AI & Autonomous Driving), FAU Erlangen-Nürnberg, 10/2022 – present. Modules: Numerical Optimization and Model Predictive Control, Robotics Frameworks, Pattern Recognition, Deep Learning.",
    "B.Tech Mechanical Engineering, APJ Abdul Kalam Technological University, India, 04/2015 – 05/2020.",
  ],
  thesis: caseStudy,
  projects: [eskf, ...studies].map(({ title, description, stack, metric, details }) => ({ title, description, stack, metric, details })),
  work: journey.filter((j) => j.id === "work"),
  skills: skills.map((s) => ({ group: s.title, items: s.items })),
  socials: activeSocials,
};
