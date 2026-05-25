'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  BookOpen, Search, GraduationCap, ShieldCheck,
  Info, Lightbulb, AlertTriangle, X, Play, FileText,
  HelpCircle, Award,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/* ─── Callout ─────────────────────────────────────────────────── */

function Callout({ type, children }: { type: 'info' | 'tip' | 'warning'; children: React.ReactNode }) {
  const map = {
    info:    { bg: 'var(--sky-soft)',   border: 'var(--sky-edge)',   icon: <Info    size={14} />, color: 'var(--sky)'   },
    tip:     { bg: 'var(--teal-soft)',  border: 'var(--teal-edge)',  icon: <Lightbulb size={14} />, color: 'var(--teal)'  },
    warning: { bg: 'var(--amber-soft)', border: 'var(--amber-edge)', icon: <AlertTriangle size={14} />, color: 'var(--amber)' },
  };
  const s = map[type];
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 10, margin: '14px 0' }}>
      <span style={{ color: s.color, flexShrink: 0, marginTop: 2 }}>{s.icon}</span>
      <div style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--fg-2)' }}>{children}</div>
    </div>
  );
}

/* ─── Types ───────────────────────────────────────────────────── */

interface DocItem {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  content: React.ReactNode;
}

interface DocGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  instructorOnly?: boolean;
  items: DocItem[];
}

/* ─── Content ─────────────────────────────────────────────────── */

const GROUPS: DocGroup[] = [

  /* ── Getting Started ───────────────────────────────────────── */
  {
    id: 'getting-started',
    label: 'Getting Started',
    icon: BookOpen,
    items: [
      {
        id: 'what-is-learnbuild',
        title: 'What is LearnBuild?',
        description: 'An overview of the LearnBuild platform and what it offers.',
        keywords: ['overview', 'introduction', 'about', 'platform', 'lms', 'e-learning', 'what is'],
        content: (
          <>
            <p>LearnBuild is a full-stack Learning Management System (LMS) for instructors who want to create and sell courses, and students who want to learn through structured, high-quality content.</p>
            <h4>What you can do</h4>
            <ul>
              <li><strong>As a guest</strong> — browse the public catalog, view course details, and read curriculum without signing in.</li>
              <li><strong>As a student</strong> — enroll in free and paid courses, watch video lessons, track progress, take notes, and earn downloadable certificates.</li>
              <li><strong>As an instructor</strong> — create multi-section courses with video, text, and quiz lessons; set pricing; and track student enrollments.</li>
              <li><strong>As an admin</strong> — manage all users, courses, and categories across the platform.</li>
            </ul>
            <Callout type="info">
              LearnBuild uses role-based access. New accounts start as Students. Contact a platform admin to request an Instructor role.
            </Callout>
            <h4>Platform highlights</h4>
            <ul>
              <li>HLS video streaming via Bunny.net CDN with signed URLs</li>
              <li>Paystack payment integration for paid course enrollment</li>
              <li>Downloadable PDF certificates on course completion</li>
              <li>Secure authentication with httpOnly JWT cookies</li>
              <li>Dark and light mode support</li>
            </ul>
          </>
        ),
      },
      {
        id: 'create-account',
        title: 'Creating Your Account',
        description: 'How to register, sign in, and manage your credentials.',
        keywords: ['register', 'sign up', 'login', 'sign in', 'account', 'password', 'email', 'forgot password', 'reset'],
        content: (
          <>
            <h4>Registering</h4>
            <p>Click <strong>Get started</strong> in the navigation bar (or visit <code>/auth/register</code>). Fill in your first name, last name, email address, and a password of at least 8 characters. A welcome email is sent once your account is created.</p>
            <Callout type="tip">
              Use a real email address — it is required for password resets and enrollment confirmations.
            </Callout>
            <h4>Signing in</h4>
            <p>Click <strong>Sign in</strong> in the nav (or visit <code>/auth/login</code>). Authentication uses secure httpOnly cookies — no tokens are stored in local storage.</p>
            <h4>Forgot your password?</h4>
            <ol>
              <li>Click <strong>Forgot password?</strong> on the sign-in page.</li>
              <li>Enter your registered email address and submit.</li>
              <li>Check your inbox for a reset link — it expires in <strong>1 hour</strong>.</li>
              <li>Click the link and enter your new password.</li>
              <li>You will be redirected to sign in automatically after 3 seconds.</li>
            </ol>
            <Callout type="warning">
              Password reset links are single-use and expire after 1 hour. If yours has expired, request a new one from the forgot password page.
            </Callout>
            <h4>Signing out</h4>
            <p>Click <strong>Sign out</strong> in the navigation bar. You will be redirected to the login page. All active sessions and refresh tokens are invalidated on logout.</p>
          </>
        ),
      },
      {
        id: 'navigating-the-platform',
        title: 'Navigating the Platform',
        description: 'A tour of the navigation bar, key pages, and how to get around.',
        keywords: ['navigation', 'nav', 'menu', 'layout', 'pages', 'header', 'theme', 'dark mode', 'light mode', 'mobile'],
        content: (
          <>
            <h4>Navigation bar</h4>
            <ul>
              <li><strong>LearnBuild logo</strong> — returns to the homepage.</li>
              <li><strong>Catalog</strong> — the public course catalog with search and filters.</li>
              <li><strong>Teach</strong> — visible to Instructors only; links to the instructor dashboard.</li>
              <li><strong>Theme toggle</strong> — switches between dark and light mode. Your preference is saved across sessions.</li>
              <li><strong>My Learning</strong> — your student dashboard with enrolled courses and certificates.</li>
              <li><strong>Sign in / Get started</strong> — shown when you are not logged in.</li>
            </ul>
            <Callout type="tip">
              On mobile, tap the hamburger menu (☰) in the top-right to access all navigation options in a collapsible dropdown.
            </Callout>
            <h4>Key pages at a glance</h4>
            <ul>
              <li><code>/</code> — Landing page with featured courses and platform overview.</li>
              <li><code>/catalog</code> — Browse all published courses.</li>
              <li><code>/catalog/[slug]</code> — Course detail page with curriculum, instructor bio, and enroll button.</li>
              <li><code>/dashboard</code> — Your personal learning dashboard (requires login).</li>
              <li><code>/learn/[slug]</code> — The in-course learning interface (requires enrollment).</li>
              <li><code>/instructor</code> — Instructor dashboard (Instructor only).</li>
              <li><code>/docs</code> — This documentation page.</li>
            </ul>
          </>
        ),
      },
      {
        id: 'roles-and-access',
        title: 'Roles & Access Levels',
        description: 'Understand the four roles on LearnBuild and what each can do.',
        keywords: ['roles', 'permissions', 'access', 'admin', 'instructor', 'student', 'guest', 'role based'],
        content: (
          <>
            <p>LearnBuild uses four roles to control what each user can see and do.</p>
            <h4>Guest</h4>
            <ul>
              <li>Browse the full course catalog without an account.</li>
              <li>View course detail pages: title, description, curriculum, instructor bio, and reviews.</li>
              <li>Watch preview lessons marked free by the instructor.</li>
              <li>Cannot enroll in any course.</li>
            </ul>
            <h4>Student (default for all new accounts)</h4>
            <ul>
              <li>Everything a Guest can do.</li>
              <li>Enroll in free and paid courses.</li>
              <li>Access the full learning interface for enrolled courses.</li>
              <li>Track progress, take notes, and mark lessons complete.</li>
              <li>Leave reviews on enrolled courses.</li>
              <li>Earn and download completion certificates.</li>
              <li>Access the personal dashboard at <code>/dashboard</code>.</li>
            </ul>
            <h4>Instructor</h4>
            <ul>
              <li>Everything a Student can do.</li>
              <li>Create, edit, and publish courses.</li>
              <li>Build course curriculum with sections and lessons.</li>
              <li>Upload video lessons, write text lessons, and create quizzes.</li>
              <li>Access the Instructor dashboard at <code>/instructor</code>.</li>
            </ul>
            <Callout type="info">
              The Instructor role is not self-serve. Contact a platform admin to have your account upgraded.
            </Callout>
          </>
        ),
      },
    ],
  },

  /* ── Student Guide ─────────────────────────────────────────── */
  {
    id: 'student-guide',
    label: 'Student Guide',
    icon: GraduationCap,
    items: [
      {
        id: 'browsing-the-catalog',
        title: 'Browsing the Catalog',
        description: 'How to search, filter, and sort courses in the public catalog.',
        keywords: ['catalog', 'browse', 'search', 'filter', 'category', 'level', 'sort', 'find courses', 'pagination'],
        content: (
          <>
            <p>The course catalog at <code>/catalog</code> is publicly accessible — no account required. It lists all published courses with search, filter, and sort options.</p>
            <h4>Searching</h4>
            <p>Type into the search bar in the left sidebar to filter courses by keyword. The search matches against course titles and descriptions.</p>
            <h4>Filtering</h4>
            <ul>
              <li><strong>Category</strong> — filter by subject area (e.g. Design, Development, Business). Categories are managed by admins.</li>
              <li><strong>Level</strong> — filter by Beginner, Intermediate, or Advanced.</li>
            </ul>
            <h4>Sorting</h4>
            <ul>
              <li><strong>Newest</strong> — most recently published first.</li>
              <li><strong>Most popular</strong> — highest student enrollment.</li>
              <li><strong>Highest rated</strong> — best average review rating.</li>
              <li><strong>Price: Low to High / High to Low</strong> — sort by course price.</li>
            </ul>
            <Callout type="tip">
              Combine search with filters for the best results. For example, search "JavaScript" and filter by Beginner level.
            </Callout>
            <h4>Course cards</h4>
            <p>Each card shows the cover image, title, instructor name, average star rating, total students, duration, and price. Click any card to open the full course detail page.</p>
            <h4>Pagination</h4>
            <p>The catalog shows 9 courses per page. Use the numbered pagination controls at the bottom to navigate. Active filters and search terms are preserved across pages.</p>
          </>
        ),
      },
      {
        id: 'enrolling-in-courses',
        title: 'Enrolling in Courses',
        description: 'How to enroll in free and paid courses, including the Paystack checkout flow.',
        keywords: ['enroll', 'buy', 'purchase', 'payment', 'paystack', 'free', 'paid', 'checkout', 'access'],
        content: (
          <>
            <p>You must be signed in to enroll in any course. Open a course detail page and click the <strong>Enroll</strong> button in the right sidebar.</p>
            <h4>Free courses</h4>
            <p>Clicking Enroll on a free course immediately grants you access. The button changes to <strong>Go to course</strong> and the course appears in your dashboard.</p>
            <h4>Paid courses</h4>
            <ol>
              <li>Click <strong>Enroll — ₦X,XXX</strong> on the course detail page.</li>
              <li>You are redirected to the Paystack checkout page.</li>
              <li>Complete payment using your card, bank transfer, or other supported method.</li>
              <li>On successful payment, Paystack sends a webhook to LearnBuild which automatically enrolls you.</li>
              <li>You are redirected back to the course detail page where the button now reads <strong>Go to course</strong>.</li>
            </ol>
            <Callout type="warning">
              Enrollment is confirmed via Paystack's webhook — not the browser redirect. If the button does not update immediately after returning, wait a moment and refresh the page.
            </Callout>
            <Callout type="info">
              Payments are processed by Paystack in Nigerian Naira (₦). Ensure your payment method supports the transaction before proceeding.
            </Callout>
          </>
        ),
      },
      {
        id: 'learning-interface',
        title: 'The Learning Interface',
        description: 'How to navigate the in-course learning room, video player, lesson types, and notes.',
        keywords: ['learn', 'lesson', 'video', 'player', 'notes', 'sidebar', 'curriculum', 'complete', 'next', 'quiz', 'text'],
        content: (
          <>
            <p>After enrolling, click <strong>Go to course</strong> (or <strong>Continue</strong> from your dashboard) to enter the learning interface at <code>/learn/[slug]</code>.</p>
            <h4>Layout overview</h4>
            <ul>
              <li><strong>Top bar</strong> — shows the course title, your progress (e.g. "3 / 12 completed"), and buttons to toggle the lesson sidebar and notes panel.</li>
              <li><strong>Lesson sidebar (left)</strong> — lists all sections and lessons. Click any lesson to jump to it. Completed lessons show a teal checkmark.</li>
              <li><strong>Main content (centre)</strong> — displays the current lesson: video player, text content, or quiz.</li>
              <li><strong>Notes panel (right)</strong> — collapsible panel for personal notes tied to each lesson.</li>
            </ul>
            <h4>Lesson types</h4>
            <ul>
              <li>
                <strong>Video</strong> <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginLeft: 2 }}><Play size={12} /></span> — streamed via Bunny.net HLS. Supports playback controls, fullscreen, and adaptive quality.
              </li>
              <li>
                <strong>Text</strong> <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginLeft: 2 }}><FileText size={12} /></span> — rich formatted content: headings, lists, code blocks, and images.
              </li>
              <li>
                <strong>Quiz</strong> <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginLeft: 2 }}><HelpCircle size={12} /></span> — interactive questions to test your understanding.
              </li>
            </ul>
            <h4>Marking lessons complete</h4>
            <p>Click <strong>Mark complete</strong> below the lesson content. The lesson gets a checkmark in the sidebar and your progress counter updates. Click <strong>Next lesson</strong> to advance automatically.</p>
            <Callout type="tip">
              You can mark lessons complete in any order — you are not forced to go sequentially, though courses are designed to be taken in order.
            </Callout>
            <h4>Notes panel</h4>
            <p>Click the sticky-note icon in the top bar to open the notes panel. Notes are per-lesson and saved automatically.</p>
            <h4>Mobile</h4>
            <p>On mobile, the lesson sidebar and notes panel open as full-screen overlays. Tap the backdrop or the close button to dismiss them.</p>
          </>
        ),
      },
      {
        id: 'tracking-progress',
        title: 'Tracking Your Progress',
        description: 'How to view enrolled courses, completion status, and stats on the dashboard.',
        keywords: ['progress', 'dashboard', 'stats', 'enrolled', 'completed', 'in progress', 'continue', 'my learning'],
        content: (
          <>
            <p>Your student dashboard at <code>/dashboard</code> gives you a full overview of your learning activity.</p>
            <h4>Stats overview</h4>
            <ul>
              <li><strong>Courses enrolled</strong> — total number of courses you have access to.</li>
              <li><strong>Certificates earned</strong> — courses you have fully completed with a certificate issued.</li>
              <li><strong>In progress</strong> — courses you have started but not yet finished.</li>
              <li><strong>Completed</strong> — courses where all lessons are marked complete.</li>
            </ul>
            <h4>My Courses</h4>
            <p>Each enrolled course card shows a progress bar and three possible action states:</p>
            <ul>
              <li><strong>Start</strong> — no progress yet.</li>
              <li><strong>Continue</strong> — resumes from where you left off.</li>
              <li><strong>Review</strong> — all lessons complete.</li>
            </ul>
            <Callout type="tip">
              Progress is calculated as the number of lessons you have marked complete divided by the total lessons in the course.
            </Callout>
          </>
        ),
      },
      {
        id: 'certificates',
        title: 'Certificates',
        description: 'How to earn, view, and download your course completion certificates as PDF.',
        keywords: ['certificate', 'completion', 'download', 'pdf', 'award', 'credential', 'finish', 'credential'],
        content: (
          <>
            <p>LearnBuild issues a completion certificate when you mark all lessons in a course as complete.</p>
            <h4>Earning a certificate</h4>
            <ol>
              <li>Enroll in any course (free or paid).</li>
              <li>Work through each lesson and click <strong>Mark complete</strong> on each one.</li>
              <li>When the progress counter shows all lessons done, a <strong>Get certificate</strong> button appears at the top of the learning interface.</li>
              <li>Click it to generate and issue your certificate.</li>
            </ol>
            <h4>Downloading your certificate</h4>
            <p>Once issued, your certificate appears in the <strong>Certificates</strong> section of your dashboard. Click <strong>Download certificate</strong> to save the PDF.</p>
            <p>The certificate includes your full name, course title, instructor name, and the date of completion.</p>
            <Callout type="info">
              Certificates are generated as PDF files and can be attached to CVs, LinkedIn profiles, or shared with employers as proof of completion.
            </Callout>
          </>
        ),
      },
      {
        id: 'leaving-reviews',
        title: 'Leaving Reviews',
        description: 'How to rate and review a course after enrolling.',
        keywords: ['review', 'rating', 'stars', 'feedback', 'comment', 'rate course'],
        content: (
          <>
            <p>After enrolling in a course, you can leave a star rating and written review on the course detail page.</p>
            <h4>How to leave a review</h4>
            <ol>
              <li>Go to the course detail page (<code>/catalog/[slug]</code>).</li>
              <li>Scroll to the <strong>Reviews</strong> section at the bottom.</li>
              <li>Select a star rating (1–5) and write your review.</li>
              <li>Click <strong>Submit review</strong>.</li>
            </ol>
            <Callout type="info">
              Only enrolled students can leave reviews. Each student can leave one review per course but can edit it at any time.
            </Callout>
            <h4>Where reviews appear</h4>
            <p>Reviews are displayed publicly on the course detail page. The average rating and total review count appear in the course stats row and on catalog cards.</p>
          </>
        ),
      },
    ],
  },

  /* ── Instructor Guide ──────────────────────────────────────── */
  {
    id: 'instructor-guide',
    label: 'Instructor Guide',
    icon: BookOpen,
    instructorOnly: true,
    items: [
      {
        id: 'becoming-an-instructor',
        title: 'Becoming an Instructor',
        description: 'How to get the Instructor role and what changes when you do.',
        keywords: ['instructor', 'role', 'teach', 'create course', 'upgrade', 'request', 'access'],
        content: (
          <>
            <p>The Instructor role is not self-assigned. All new accounts start as Students. To become an instructor:</p>
            <ol>
              <li>Create a LearnBuild account if you do not already have one.</li>
              <li>Contact the platform admin and request your account be upgraded to Instructor.</li>
              <li>Once upgraded, sign out and back in to refresh your session.</li>
            </ol>
            <h4>What changes with the Instructor role</h4>
            <ul>
              <li>A <strong>Teach</strong> link appears in the navigation bar.</li>
              <li>You can access the Instructor dashboard at <code>/instructor</code>.</li>
              <li>You can create, edit, and publish courses from the dashboard.</li>
              <li>Your Student access is fully preserved — you can still enroll in other courses.</li>
            </ul>
            <Callout type="info">
              Having the Instructor role does not remove your ability to enroll in and learn from courses as a student.
            </Callout>
          </>
        ),
      },
      {
        id: 'creating-a-course',
        title: 'Creating a Course',
        description: 'How to set up a new course: title, description, category, level, pricing, and cover image.',
        keywords: ['create course', 'new course', 'title', 'description', 'category', 'level', 'price', 'cover image', 'requirements', 'outcomes', 'draft'],
        content: (
          <>
            <p>From the Instructor dashboard at <code>/instructor</code>, click <strong>New course</strong> to open the course editor.</p>
            <h4>Required fields</h4>
            <ul>
              <li><strong>Title</strong> — the public name of your course. Be clear and specific.</li>
              <li><strong>Short description</strong> — one or two sentences shown on catalog cards. Max 300 characters.</li>
              <li><strong>Level</strong> — Beginner, Intermediate, or Advanced. Choose based on assumed prior knowledge.</li>
            </ul>
            <h4>Optional but recommended fields</h4>
            <ul>
              <li><strong>Full description</strong> — displayed on the course detail page. Explain what the course covers, who it is for, and what students will achieve.</li>
              <li><strong>Category</strong> — assigns the course to a category for catalog filtering. Categories are managed by admins.</li>
              <li><strong>Language</strong> — the language in which the course is taught.</li>
              <li><strong>Learning outcomes</strong> — specific skills students will gain. Shown as a checklist on the detail page.</li>
              <li><strong>Requirements</strong> — prerequisites students should have before starting. Shown as a bullet list.</li>
              <li><strong>Cover image</strong> — uploaded to Cloudflare R2. Recommended: 1280×720px (16:9), JPG or PNG.</li>
            </ul>
            <h4>Pricing</h4>
            <ul>
              <li>Set to <strong>0</strong> to make the course free.</li>
              <li>Enter an amount in Naira (₦) to make it a paid course.</li>
            </ul>
            <Callout type="tip">
              Courses are saved as drafts by default and are invisible in the catalog until you publish them. Take your time building your course before going live.
            </Callout>
          </>
        ),
      },
      {
        id: 'building-curriculum',
        title: 'Building Your Curriculum',
        description: 'How to add sections, lessons, upload videos, and reorder content.',
        keywords: ['curriculum', 'section', 'lesson', 'video', 'upload', 'reorder', 'drag', 'preview', 'text lesson', 'quiz', 'bunny', 'chapter'],
        content: (
          <>
            <p>The curriculum builder is in the course editor under the <strong>Curriculum</strong> tab. Courses are organised into <strong>sections</strong> (chapters) each containing one or more <strong>lessons</strong>.</p>
            <h4>Adding sections</h4>
            <p>Click <strong>Add section</strong> to create a new chapter. Give it a descriptive title (e.g. "Introduction", "Module 2: Core Concepts").</p>
            <h4>Adding lessons</h4>
            <p>Within each section, click <strong>Add lesson</strong>. Each lesson requires:</p>
            <ul>
              <li><strong>Title</strong> — the lesson name shown in the curriculum sidebar.</li>
              <li><strong>Type</strong> — Video, Text, or Quiz.</li>
              <li><strong>Preview</strong> — toggle to allow non-enrolled users to access this lesson for free. Use for introductory lessons to give prospective students a taste of your content.</li>
            </ul>
            <h4>Video lessons</h4>
            <p>Upload your video file directly. Videos are stored and streamed via <strong>Bunny.net</strong> with CDN delivery and HLS adaptive streaming. Recommended format: MP4 (H.264), up to 4K.</p>
            <Callout type="warning">
              Large video uploads may take a few minutes to process on Bunny.net before they become playable. The lesson is saved immediately but video playback is not available until processing completes.
            </Callout>
            <h4>Text lessons</h4>
            <p>A rich-text editor lets you write formatted content with headings, lists, code blocks, bold/italic text, and inline images.</p>
            <h4>Reordering</h4>
            <p>Drag sections and lessons using the drag handle on the left to reorder them. The order in the builder is the order students see in the learning interface.</p>
            <Callout type="tip">
              Mark your first one or two lessons as <strong>Preview</strong> so prospective students can sample your teaching style before enrolling.
            </Callout>
          </>
        ),
      },
      {
        id: 'publishing-your-course',
        title: 'Publishing Your Course',
        description: 'How to make your course live in the catalog and manage its visibility.',
        keywords: ['publish', 'draft', 'live', 'visibility', 'unpublish', 'go live', 'catalog'],
        content: (
          <>
            <p>All new courses start as <strong>Draft</strong> — invisible to students and not listed in the catalog.</p>
            <h4>Pre-publish checklist</h4>
            <ul>
              <li>Course title and short description are filled in.</li>
              <li>At least one section with at least one lesson exists.</li>
              <li>Pricing is set (0 for free, or an amount in ₦).</li>
              <li>A cover image has been uploaded (strongly recommended).</li>
              <li>Learning outcomes and requirements are filled in (recommended).</li>
            </ul>
            <h4>Publishing</h4>
            <p>In the course editor, toggle the <strong>Published</strong> switch. Once published, the course immediately appears in the catalog and is searchable by all users.</p>
            <h4>Unpublishing</h4>
            <p>You can toggle a published course back to Draft at any time. Unpublishing hides the course from the catalog but does not affect students already enrolled — they retain full access.</p>
            <Callout type="info">
              Editing a published course (updating lessons, adding new sections) does not require unpublishing. Changes are reflected immediately for enrolled students.
            </Callout>
          </>
        ),
      },
      {
        id: 'instructor-analytics',
        title: 'Instructor Analytics',
        description: 'How to view enrollments, student progress, and revenue on your courses.',
        keywords: ['analytics', 'enrollments', 'students', 'stats', 'revenue', 'progress', 'dashboard', 'earnings'],
        content: (
          <>
            <p>The Instructor dashboard at <code>/instructor</code> gives you an overview of all your courses and their performance.</p>
            <h4>Course list</h4>
            <p>Each course in the instructor dashboard shows:</p>
            <ul>
              <li>Course title and published status (Draft / Published).</li>
              <li>Total enrolled students.</li>
              <li>Average star rating.</li>
              <li>Total revenue earned for paid courses.</li>
            </ul>
            <h4>Per-course analytics</h4>
            <ul>
              <li>Enrollment count over time.</li>
              <li>Number of students who completed the course.</li>
              <li>Individual lesson completion rates.</li>
            </ul>
            <Callout type="tip">
              If a particular lesson has a high drop-off rate, consider revisiting its content or splitting it into shorter segments.
            </Callout>
          </>
        ),
      },
    ],
  },

  /* ── Admin Guide ───────────────────────────────────────────── */
  {
    id: 'admin-guide',
    label: 'Admin Guide',
    icon: ShieldCheck,
    adminOnly: true,
    items: [
      {
        id: 'admin-overview',
        title: 'Admin Overview',
        description: 'An introduction to the admin panel and platform-wide controls.',
        keywords: ['admin', 'panel', 'overview', 'platform', 'management', 'control', 'stats'],
        content: (
          <>
            <p>The admin panel at <code>/admin</code> gives you full visibility and control over the entire LearnBuild platform. It is accessible only to users with the <strong>Admin</strong> role.</p>
            <h4>Admin panel sections</h4>
            <ul>
              <li><strong>Overview</strong> — platform-wide stats: total users, total courses, active enrollments, and revenue.</li>
              <li><strong>Users</strong> — list of all registered accounts with role management.</li>
              <li><strong>Courses</strong> — all courses (draft and published) with moderation controls.</li>
              <li><strong>Categories</strong> — manage the course categories used in the catalog filter.</li>
            </ul>
            <Callout type="warning">
              Admin actions are immediate and mostly irreversible (e.g. deleting a user or course). Always double-check before confirming destructive actions.
            </Callout>
            <h4>Accessing the admin panel</h4>
            <p>Click the <strong>Admin</strong> button (shield icon) in the navigation bar. This button is only visible to users with the Admin role.</p>
          </>
        ),
      },
      {
        id: 'managing-users',
        title: 'Managing Users',
        description: 'How to view, change roles, and manage user accounts platform-wide.',
        keywords: ['users', 'roles', 'manage', 'change role', 'instructor', 'admin', 'student', 'accounts'],
        content: (
          <>
            <p>The Users page at <code>/admin/users</code> lists every registered account on the platform.</p>
            <h4>User table columns</h4>
            <ul>
              <li><strong>Name</strong> — first and last name.</li>
              <li><strong>Email</strong> — registered email address.</li>
              <li><strong>Role</strong> — current role: STUDENT, INSTRUCTOR, or ADMIN.</li>
              <li><strong>Joined</strong> — account creation date.</li>
              <li><strong>Actions</strong> — role change and account management controls.</li>
            </ul>
            <h4>Changing a user's role</h4>
            <ol>
              <li>Find the user in the table.</li>
              <li>Click the role dropdown or <strong>Edit</strong> in the Actions column.</li>
              <li>Select the new role: STUDENT, INSTRUCTOR, or ADMIN.</li>
              <li>Confirm the change.</li>
            </ol>
            <Callout type="warning">
              Granting a user the ADMIN role gives them full platform access including the ability to change other users' roles. Be deliberate about who receives Admin access.
            </Callout>
            <Callout type="tip">
              After a role change, the user needs to sign out and back in (or wait for their token to refresh) to see the new role reflected in their navigation.
            </Callout>
          </>
        ),
      },
      {
        id: 'managing-courses',
        title: 'Managing Courses',
        description: 'How to review, moderate, and delete courses across the platform.',
        keywords: ['courses', 'manage', 'moderate', 'delete', 'publish', 'unpublish', 'admin courses'],
        content: (
          <>
            <p>The Courses page at <code>/admin/courses</code> shows every course — both draft and published — regardless of instructor.</p>
            <h4>Course table columns</h4>
            <ul>
              <li><strong>Title</strong> — course name with a link to the public course page.</li>
              <li><strong>Instructor</strong> — the course creator's name.</li>
              <li><strong>Status</strong> — Draft or Published.</li>
              <li><strong>Students</strong> — total enrollment count.</li>
              <li><strong>Price</strong> — free (₦0) or paid amount.</li>
              <li><strong>Actions</strong> — publish/unpublish toggle and delete button.</li>
            </ul>
            <h4>Force-publishing or unpublishing</h4>
            <p>As an admin, you can toggle the published state of any course — useful for removing inappropriate content or publishing on behalf of an instructor.</p>
            <h4>Deleting a course</h4>
            <p>Clicking <strong>Delete</strong> permanently removes the course and all associated data. Enrolled students lose access immediately. This action cannot be undone.</p>
            <Callout type="warning">
              Consider unpublishing instead of deleting if you want to hide a course temporarily without losing student enrollment data.
            </Callout>
          </>
        ),
      },
      {
        id: 'managing-categories',
        title: 'Managing Categories',
        description: 'How to add, edit, and remove course categories used in the catalog filter.',
        keywords: ['categories', 'category', 'tags', 'filter', 'manage', 'add', 'delete', 'edit'],
        content: (
          <>
            <p>Categories are the subject labels used to filter courses in the catalog (e.g. "Development", "Design", "Business"). They are managed exclusively by admins at <code>/admin/categories</code>.</p>
            <h4>Adding a category</h4>
            <ol>
              <li>Go to <code>/admin/categories</code>.</li>
              <li>Click <strong>Add category</strong>.</li>
              <li>Enter a name (e.g. "Marketing") and save.</li>
              <li>The category is immediately available for instructors to assign to courses.</li>
            </ol>
            <h4>Editing a category</h4>
            <p>Click the edit icon next to a category name. Updating the name reflects everywhere the category appears — on course detail pages, catalog filters, and course cards.</p>
            <h4>Deleting a category</h4>
            <p>Click the delete icon. Courses assigned to this category will have their category cleared, but the courses themselves are not deleted.</p>
            <Callout type="tip">
              Keep categories broad and consistent. Too many narrow categories clutter the sidebar filter. Aim for 6–12 top-level categories.
            </Callout>
          </>
        ),
      },
    ],
  },
];

/* ─── DocsPage Component ──────────────────────────────────────── */

export default function DocsPage() {
  const { user, isAdmin, isInstructor } = useAuth();

  const [activeId, setActiveId] = useState<string>('');
  const [query, setQuery] = useState('');
  const [pendingNav, setPendingNav] = useState<string | null>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Filter groups by role
  const visibleGroups = GROUPS.filter((g) => {
    if (g.adminOnly && !isAdmin) return false;
    if (g.instructorOnly && !isInstructor && !isAdmin) return false;
    return true;
  });

  // All visible items flat
  const allItems = visibleGroups.flatMap((g) =>
    g.items.map((item) => ({ ...item, groupLabel: g.label }))
  );

  // Search results
  const searchResults = query.trim()
    ? allItems.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.keywords.some((k) => k.includes(q))
        );
      })
    : [];

  // Scroll spy
  const setupObserver = useCallback(() => {
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const top = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          );
          setActiveId((top.target as HTMLElement).dataset.sectionId ?? '');
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );
    sectionRefs.current.forEach((el) => observerRef.current!.observe(el));
  }, []);

  useEffect(() => {
    setupObserver();
    return () => observerRef.current?.disconnect();
  }, [setupObserver, visibleGroups.length]);

  // Navigate to a section
  const navTo = (id: string) => {
    setQuery('');
    setPendingNav(id);
  };

  useEffect(() => {
    if (!pendingNav) return;
    const el = sectionRefs.current.get(pendingNav);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setPendingNav(null);
    }
  }, [pendingNav]);

  return (
    <>
      <style>{`
        .docs-wrap { display: flex; gap: 0; min-height: calc(100vh - 56px); }
        .docs-toc {
          width: 232px; shrink: 0; border-right: 1px solid var(--border);
          padding: 32px 0; position: sticky; top: 56px; height: calc(100vh - 56px);
          overflow-y: auto; background: var(--surface); flex-shrink: 0;
        }
        .docs-toc-group { margin-bottom: 20px; }
        .docs-toc-group-label {
          display: flex; align-items: center; gap: 7px;
          font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase;
          color: var(--fg-4); padding: 0 20px 6px;
        }
        .docs-toc-item {
          display: block; padding: 5px 20px; font-size: 13px; color: var(--fg-3);
          cursor: pointer; transition: color 120ms, background 120ms;
          text-decoration: none; border: none; background: none; width: 100%; text-align: left;
        }
        .docs-toc-item:hover { color: var(--fg); background: var(--card-2); }
        .docs-toc-item.active { color: var(--sky); background: var(--sky-soft); font-weight: 500; }

        .docs-main { flex: 1; min-width: 0; padding: 32px 48px 80px; max-width: 780px; }

        .docs-search-wrap { position: relative; margin-bottom: 32px; }
        .docs-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--fg-4); pointer-events: none; }
        .docs-search {
          width: 100%; padding: 9px 12px 9px 36px; font-size: 14px;
          background: var(--card); border: 1px solid var(--border); border-radius: 8px;
          color: var(--fg); outline: none; transition: border-color 120ms;
        }
        .docs-search:focus { border-color: var(--sky); }
        .docs-search-clear {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: var(--fg-4);
          display: flex; align-items: center; padding: 2px;
        }
        .docs-search-clear:hover { color: var(--fg); }

        .docs-results { display: flex; flex-direction: column; gap: 4px; }
        .docs-result {
          display: flex; flex-direction: column; gap: 2px;
          padding: 12px 14px; border-radius: 8px; cursor: pointer;
          border: 1px solid var(--border); background: var(--card);
          transition: border-color 120ms, background 120ms; text-decoration: none;
        }
        .docs-result:hover { border-color: var(--border-strong); background: var(--card-2); }
        .docs-result-meta { font-size: 11px; color: var(--fg-4); }
        .docs-result-title { font-size: 14px; font-weight: 500; color: var(--fg); }
        .docs-result-desc { font-size: 13px; color: var(--fg-3); }

        .docs-group-header {
          display: flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase;
          color: var(--fg-4); margin: 40px 0 20px; padding-bottom: 10px;
          border-bottom: 1px solid var(--border);
        }
        .docs-group-header:first-child { margin-top: 0; }

        .docs-section { scroll-margin-top: 80px; margin-bottom: 48px; }
        .docs-section h3 { font-size: 20px; font-weight: 700; color: var(--fg); margin: 0 0 6px; }
        .docs-section-desc { font-size: 14px; color: var(--fg-3); margin: 0 0 20px; }
        .docs-section-body { font-size: 14px; line-height: 1.75; color: var(--fg-2); }
        .docs-section-body h4 { font-size: 15px; font-weight: 600; color: var(--fg); margin: 24px 0 8px; }
        .docs-section-body p { margin: 0 0 12px; }
        .docs-section-body ul, .docs-section-body ol { padding-left: 20px; margin: 0 0 12px; }
        .docs-section-body li { margin-bottom: 5px; }
        .docs-section-body code {
          font-family: var(--font-mono, monospace); font-size: 12.5px;
          background: var(--card-2); border: 1px solid var(--border);
          border-radius: 4px; padding: 1px 5px; color: var(--sky-2);
        }
        .docs-section-body strong { color: var(--fg); font-weight: 600; }

        @media (max-width: 900px) {
          .docs-main { padding: 24px 24px 60px; }
        }
        @media (max-width: 680px) {
          .docs-toc { display: none; }
          .docs-main { padding: 20px 16px 60px; }
        }
      `}</style>

      <div className="docs-wrap">
        {/* TOC sidebar */}
        <aside className="docs-toc">
          {visibleGroups.map((group) => {
            const Icon = group.icon;
            return (
              <div key={group.id} className="docs-toc-group">
                <div className="docs-toc-group-label">
                  <Icon size={11} />
                  {group.label}
                </div>
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    className={`docs-toc-item${activeId === item.id ? ' active' : ''}`}
                    onClick={() => navTo(item.id)}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            );
          })}
        </aside>

        {/* Main content */}
        <main className="docs-main">
          {/* Page header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--fg)', margin: '0 0 4px' }}>Documentation</h1>
            <p style={{ fontSize: 14, color: 'var(--fg-3)', margin: 0 }}>
              Guides and reference for every role on LearnBuild.
              {!user && (
                <> <span style={{ color: 'var(--fg-4)' }}>Sign in to see instructor and admin guides.</span></>
              )}
            </p>
          </div>

          {/* Search */}
          <div className="docs-search-wrap">
            <span className="docs-search-icon"><Search size={15} /></span>
            <input
              className="docs-search"
              placeholder="Search documentation…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button className="docs-search-clear" onClick={() => setQuery('')}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Search results */}
          {query.trim() ? (
            <div className="docs-results">
              {searchResults.length === 0 ? (
                <p style={{ color: 'var(--fg-3)', fontSize: 14 }}>No results for &ldquo;{query}&rdquo;</p>
              ) : (
                searchResults.map((item) => (
                  <button key={item.id} className="docs-result" onClick={() => navTo(item.id)}>
                    <span className="docs-result-meta">{item.groupLabel}</span>
                    <span className="docs-result-title">{item.title}</span>
                    <span className="docs-result-desc">{item.description}</span>
                  </button>
                ))
              )}
            </div>
          ) : (
            /* Section content */
            visibleGroups.map((group) => {
              const Icon = group.icon;
              return (
                <div key={group.id}>
                  <div className="docs-group-header">
                    <Icon size={12} />
                    {group.label}
                  </div>
                  {group.items.map((item) => (
                    <section
                      key={item.id}
                      className="docs-section"
                      data-section-id={item.id}
                      ref={(el) => {
                        if (el) sectionRefs.current.set(item.id, el);
                        else sectionRefs.current.delete(item.id);
                      }}
                    >
                      <h3>{item.title}</h3>
                      <p className="docs-section-desc">{item.description}</p>
                      <div className="docs-section-body">{item.content}</div>
                    </section>
                  ))}
                </div>
              );
            })
          )}
        </main>
      </div>
    </>
  );
}
