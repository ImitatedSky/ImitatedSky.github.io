import { FaHome, FaArchive, FaTags, FaFolderOpen, FaLink, FaCommentDots } from "react-icons/fa";
import type { IconType } from "react-icons";

export const SITE = {
  name: "Imisky",
  author: "ImitatedSky",
  baseUrl: "https://pochunyeh.com",
  copyrightFrom: 2020,
  github: "https://github.com/ImitatedSky",
  email: "yehforlivelihood@gmail.com",
  linkedin: "https://www.linkedin.com/in/pochunyeh1997/",
  tagline: "Coding · LeetCode · Life",
  announcement:
    "如果在使用中遇到問題，可以到 Github Issues 進行反饋。",
  announcementLink: "https://github.com/ImitatedSky/blog-utterances/issues",
  /** busuanzi UV/PV counter — keep off until the domain switches to the React site */
  busuanzi: false,
  typedStrings: [
    "比起華爾茲我更喜歡搖籃曲",
    "若再許我少年時，一兩黃金一兩風",
    "True mastery of any skill takes a lifetime.",
    "Bravery never goes out of fashion.",
    "Never underestimate your power to change yourself!",
  ],
} as const;

/** Share URLs kept in one place — platforms change their endpoints occasionally */
export const SHARE_URLS = {
  facebook: (url: string) =>
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  x: (url: string, title: string) =>
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  line: (url: string) =>
    `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`,
} as const;

export interface NavLink {
  to: string;
  label: string;
  icon: IconType;
}

export const NAV_LINKS: NavLink[] = [
  { to: "/", label: "Home", icon: FaHome },
  { to: "/archives", label: "Archives", icon: FaArchive },
  { to: "/tags", label: "Tags", icon: FaTags },
  { to: "/categories", label: "Categories", icon: FaFolderOpen },
  { to: "/links", label: "Links", icon: FaLink },
  { to: "/messageboard", label: "Message", icon: FaCommentDots },
];
