// Material Symbols icon name registry — one source of truth for all icon names.
// Usage: import { Icons } from "@/lib/icons"; then <Icon name={Icons.home} />

export const Icons = {
  // Navigation / BottomNav
  home: "home",
  homeActive: "home",
  subjects: "menu_book",
  subjectsActive: "menu_book",
  tests: "assignment",
  testsActive: "assignment",
  doubts: "forum",
  doubtsActive: "forum",
  profile: "person",
  profileActive: "person",

  // General actions
  back: "arrow_back",
  forward: "arrow_forward",
  close: "close",
  menu: "menu",
  search: "search",
  filter: "filter_list",
  sort: "sort",
  more: "more_vert",
  edit: "edit",
  delete: "delete",
  add: "add",
  check: "check",
  checkCircle: "check_circle",
  info: "info",
  warning: "warning",
  error: "error",
  help: "help",

  // Content / Learning
  play: "play_circle",
  pause: "pause_circle",
  replay: "replay",
  videoLesson: "smart_display",
  book: "menu_book",
  chapter: "layers",
  lesson: "play_lesson",
  note: "sticky_note_2",
  download: "download",

  // Tests
  quiz: "quiz",
  timer: "timer",
  timerOff: "timer_off",
  clock: "schedule",
  trophy: "emoji_events",
  star: "star",
  starOutline: "star",
  correct: "check_circle",
  wrong: "cancel",
  skip: "skip_next",
  submit: "send",
  review: "rate_review",
  explanation: "lightbulb",
  score: "scoreboard",
  percentage: "percent",
  question: "help_circle",
  palette: "grid_view",

  // Stats / Progress
  streak: "local_fire_department",
  progress: "trending_up",
  accuracy: "target",
  time: "schedule",
  rank: "leaderboard",
  badge: "military_tech",

  // Subscription / Premium
  lock: "lock",
  unlock: "lock_open",
  crown: "workspace_premium",
  diamond: "diamond",
  sparkle: "auto_awesome",

  // Profile / Account
  settings: "settings",
  logout: "logout",
  notifications: "notifications",
  avatar: "account_circle",
  camera: "photo_camera",
  phone: "phone",
  email: "mail",
  school: "school",
  class: "class",

  // Doubts
  doubt: "contact_support",
  send: "send",
  image: "image",
  attach: "attach_file",
  resolve: "task_alt",
  pending: "pending",

  // Misc
  calendar: "calendar_today",
  location: "location_on",
  link: "link",
  share: "share",
  copy: "content_copy",
  refresh: "refresh",
  loading: "progress_activity",
  empty: "inbox",
} as const;

export type IconName = (typeof Icons)[keyof typeof Icons];
