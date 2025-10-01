"use client"

import { useState, useEffect } from "react"
import { Link as RouterLink } from "react-router-dom"
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  alpha,
  Fade,
  Zoom,
  Chip,
} from "@mui/material"
import {
  Task as TaskIcon,
  Groups as GroupsIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  CalendarViewMonth as CalendarViewMonthIcon,
  NotificationsActive as NotificationsActiveIcon,
  ManageAccounts as ManageAccountsIcon,
  ArrowForward as ArrowForwardIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from "@mui/icons-material"
import { useTheme as useThemeContext } from "../context/ThemeContext";


// Technology logos as SVG components
const ReactLogo = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="#61DAFB">
    <path d="M12 10.11c1.03 0 1.87.84 1.87 1.89s-.84 1.89-1.87 1.89c-1.03 0-1.87-.84-1.87-1.89s.84-1.89 1.87-1.89M7.37 20c.63.38 2.01-.2 3.6-1.7-.52-.59-1.03-1.23-1.51-1.9a22.7 22.7 0 0 1-2.4-.36c-.51 2.14-.32 3.61.31 3.96m.71-5.74l-.29-.51c-.11.29-.22.58-.29.86.27.06.57.11.88.16l-.3-.51m6.54-.76l.81-1.5-.81-1.5c-.3-.53-.62-1-.91-1.47C13.17 9 12.6 9 12 9s-1.17 0-1.71.03c-.29.47-.61.94-.91 1.47L8.57 12l.81 1.5c.3.53.62 1 .91 1.47M12 6.78c-.19.22-.39.45-.59.72h1.18c-.2-.27-.4-.5-.59-.72m0 10.44c.19-.22.39-.45.59-.72h-1.18c.2.27.4.5.59.72M16.62 4c-.62-.38-2 .2-3.59 1.7.52.59 1.03 1.23 1.51 1.9.82.08 1.63.2 2.4.36.51-2.14.32-3.61-.32-3.96m-.7 5.74l.29.51c.11-.29.22-.58.29-.86-.27-.06-.57-.11-.88-.16l.3.51m1.45-7.05c1.47.84 1.63 3.05 1.01 5.63 2.54.75 4.37 1.99 4.37 3.68s-1.83 2.93-4.37 3.68c-.62 2.58-.46 4.79 1.01 5.63 1.46.84 3.45-.12 5.37-1.95 1.92 1.83 3.91 2.79 5.37 1.95 1.47-.84 1.63-3.05 1.01-5.63-2.54-.75-4.37-1.99-4.37-3.68s1.83-2.93 4.37-3.68c.62-2.58.46-4.79-1.01-5.63 1.46-.84 3.45.12 5.37 1.95 1.92-1.83 3.91-2.79 5.37-1.95z" />
  </svg>
)

const NodeLogo = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="#339933">
    <path d="M12 1.85c-.27 0-.55.07-.78.2l-7.44 4.3c-.48.28-.78.8-.78 1.36v8.58c0 .56.3 1.08.78 1.36l1.95 1.12c.95.46 1.27.46 1.71.46.85 0 1.31-.52 1.31-1.36V9.47c0-.09-.07-.16-.16-.16H7.75c-.09 0-.16.07-.16.16v8.4c0 .45-.49.62-.9.35l-1.94-1.12c-.05-.03-.08-.08-.08-.14V8.38c0-.06.03-.11.08-.14l7.44-4.3c.05-.03.12-.03.17 0l7.44 4.3c.05.03.08.08.08.14v8.58c0 .06-.03.11-.08.14l-7.44 4.3c-.23-.13-.51-.2-.78-.2z" />
  </svg>
)

const ExpressLogo = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="#000000">
    <path d="M24 18.588a1.529 1.529 0 01-1.895-.72l-3.45-4.771-.5-.667-4.003 5.444a1.466 1.466 0 01-1.802.708l5.158-6.92-4.798-6.251a1.595 1.595 0 011.9.666l3.576 4.83 3.596-4.81a1.435 1.435 0 011.788-.668L21.708 7.9l-2.522 3.283a.666.666 0 000 .994l4.804 6.412zM.002 11.576l.42-2.075c1.154-4.103 5.858-5.81 9.094-3.27 1.895 1.489 2.368 3.597 2.275 5.973H1.116C.943 16.447 4.005 19.009 7.92 17.7a4.078 4.078 0 002.582-2.876c.207-.666.548-.78 1.174-.588a5.417 5.417 0 01-2.589 3.957c-2.864 1.607-6.509.018-8.2-2.779a1.014 1.014 0 01-.063-.135C.501 14.618 0 13.12.002 11.576zM1.116 10.073h10.44c.363-2.321-1.342-4.576-3.729-4.514-2.382.067-3.81 2.096-6.711 4.514z" />
  </svg>
)

const MongoLogo = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="#47A248">
    <path d="M17.193 9.555c-1.264-5.58-4.252-7.414-4.573-8.115-.28-.394-.53-.954-.735-1.44-.036.495-.055.685-.523 1.184-.723.566-4.438 3.682-4.74 10.02-.282 5.912 4.27 9.435 4.888 9.884l.07.05A73.49 73.49 0 0111.91 24h.481c.114-1.032.284-2.056.51-3.07.417-.296.604-.463.85-.693a11.342 11.342 0 003.639-8.464c.01-.814-.103-1.662-.197-2.218zm-5.336 8.195s0-8.291.275-8.29c.213 0 .49 10.695.49 10.695-.381-.045-.765-1.76-.765-2.405z" />
  </svg>
)

const SocketIOLogo = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="#010101">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 14.568a1.5 1.5 0 01-2.136 0L12 11.136l-3.432 3.432a1.5 1.5 0 01-2.136-2.136L9.864 9 6.432 5.568a1.5 1.5 0 012.136-2.136L12 6.864l3.432-3.432a1.5 1.5 0 012.136 2.136L14.136 9l3.432 3.432a1.5 1.5 0 010 2.136z" />
  </svg>
)

const MUILogo = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="#007FFF">
    <path d="M8.024 3.632L2.4 7.2v9.6l5.624 3.568V24l8.976-5.632V8.768L8.024 3.632zm0 2.4L13.648 9.6 8.024 13.168 2.4 9.6l5.624-3.568zm0 11.136v-4.8L13.648 15.936v4.8L8.024 17.168z" />
  </svg>
)

const LandingPage = () => {
  const theme = useTheme()
  const { isDarkMode, toggleDarkMode } = useThemeContext();
  const [isVisible, setIsVisible] = useState({})

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      { threshold: 0.1 },
    )

    const elements = document.querySelectorAll("[data-animate]")
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
  }

  const features = [
    {
      icon: <GroupsIcon sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Real-Time Collaboration",
      description:
        "See who's online with live status indicators. Get instant notifications for important updates so your entire team is always on the same page.",
    },
    {
      icon: <AdminPanelSettingsIcon sx={{ fontSize: 40, color: "error.main" }} />,
      title: "Powerful Role Management",
      description:
        "Three distinct roles—User, Team Leader, and Superadmin—ensure everyone has the right level of access and control, from creating tasks to managing the entire workspace.",
    },
    {
      icon: <AssignmentTurnedInIcon sx={{ fontSize: 40, color: "success.main" }} />,
      title: "Flexible Task Assignment",
      description:
        "Assign tasks to entire teams for cross-functional projects or to specific individuals for focused work. Team Leaders and Admins have granular control.",
    },
    {
      icon: <CalendarViewMonthIcon sx={{ fontSize: 40, color: "info.main" }} />,
      title: "Multiple Project Views",
      description:
        "Visualize your workflow with a clear task board and an interactive calendar view. Click on any task to see its full details, including description, deadline, and assignees.",
    },
    {
      icon: <NotificationsActiveIcon sx={{ fontSize: 40, color: "warning.main" }} />,
      title: "Instant Notifications",
      description:
        "Stay in the loop with a real-time notification center. Get alerts for new task assignments, team invitations, and role changes.",
    },
    {
      icon: <ManageAccountsIcon sx={{ fontSize: 40, color: "secondary.main" }} />,
      title: "Seamless Team Administration",
      description:
        "Superadmins can create and delete teams, while Team Leaders can manage their own team's members. Role changes and cleanup are handled automatically.",
    },
  ]

  const technologies = [
    { name: "React.js", logo: <ReactLogo /> },
    { name: "Node.js", logo: <NodeLogo /> },
    { name: "Express.js", logo: <ExpressLogo /> },
    { name: "MongoDB", logo: <MongoLogo /> },
    { name: "Socket.IO", logo: <SocketIOLogo /> },
    { name: "Material-UI", logo: <MUILogo /> },
  ]

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `
          linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.05)} 0%, 
            ${alpha(theme.palette.secondary.main, 0.05)} 100%
          ),
          radial-gradient(circle at 20% 80%, 
            ${alpha(theme.palette.primary.light, 0.1)} 0%, 
            transparent 50%
          ),
          radial-gradient(circle at 80% 20%, 
            ${alpha(theme.palette.secondary.light, 0.1)} 0%, 
            transparent 50%
          ),
          radial-gradient(circle at 40% 40%, 
            ${alpha(theme.palette.info.light, 0.05)} 0%, 
            transparent 50%
          )
        `,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 98px,
              ${alpha(theme.palette.divider, 0.03)} 100px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 98px,
              ${alpha(theme.palette.divider, 0.03)} 100px
            )
          `,
          pointerEvents: "none",
        },
      }}
    >
      {/* Floating Elements */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
          animation: "float 6s ease-in-out infinite",
          "@keyframes float": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-20px)" },
          },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "60%",
          right: "15%",
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: `linear-gradient(45deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.warning.main, 0.1)})`,
          animation: "float 8s ease-in-out infinite reverse",
        }}
      />

      {/* Header */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <TaskIcon sx={{ mr: 1.5, color: "primary.main" }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: "text.primary" }}>
              TaskFlow
            </Typography>
          </Box>
          <IconButton onClick={toggleDarkMode} sx={{ color: "text.secondary" }}>
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <Button
            component={RouterLink}
            to="/auth"
            variant="contained"
            sx={{
              ml: 2,
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 500,
              px: 3,
            }}
          >
            Sign In
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          pt: 8,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in timeout={1000}>
                <Box>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: "2.5rem", md: "3.5rem", lg: "4rem" },
                      fontWeight: 700,
                      lineHeight: 1.1,
                      mb: 3,
                      background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Streamline Your Workflow. Achieve More, Together.
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      color: "text.secondary",
                      mb: 4,
                      lineHeight: 1.6,
                      fontWeight: 400,
                    }}
                  >
                    TaskFlow is a real-time, collaborative task manager designed for teams that need clarity and power.
                    Organize projects, assign tasks, and track progress seamlessly.
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Button
                      component={RouterLink}
                      to="/auth"
                      variant="contained"
                      size="large"
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        textTransform: "none",
                        boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                        "&:hover": {
                          boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                          transform: "translateY(-2px)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Get Started for Free
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      endIcon={<KeyboardArrowDownIcon />}
                      onClick={scrollToFeatures}
                      sx={{
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        fontSize: "1.1rem",
                        fontWeight: 500,
                        textTransform: "none",
                        borderWidth: 2,
                        "&:hover": {
                          borderWidth: 2,
                          transform: "translateY(-2px)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Learn More
                    </Button>
                  </Box>
                </Box>
              </Fade>
            </Grid>
            <Grid item xs={12} md={6}>
              <Zoom in timeout={1200}>
                <Box
                  sx={{
                    position: "relative",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: -20,
                      left: -20,
                      right: -20,
                      bottom: -20,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                      borderRadius: 4,
                      filter: "blur(20px)",
                      zIndex: -1,
                    },
                  }}
                >
                </Box>
              </Zoom>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box
        id="features"
        data-animate
        sx={{
          py: 12,
          position: "relative",
        }}
      >
        <Container maxWidth="lg">
          <Fade in={isVisible.features} timeout={1000}>
            <Box sx={{ textAlign: "center", mb: 8 }}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  fontWeight: 700,
                  mb: 2,
                  background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Everything You Need to Keep Your Team in Sync
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
                Powerful features designed to streamline collaboration and boost productivity
              </Typography>
            </Box>
          </Fade>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Zoom in={isVisible.features} timeout={1000 + index * 200}>
                  <Card
                    sx={{
                      height: "100%",
                      p: 3,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
                      backdropFilter: "blur(20px)",
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.15)}`,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 0 }}>
                      <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Technology Stack Section */}
      <Box
        id="tech-stack"
        data-animate
        sx={{
          py: 12,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})`,
        }}
      >
        <Container maxWidth="lg">
          <Fade in={isVisible["tech-stack"]} timeout={1000}>
            <Box sx={{ textAlign: "center", mb: 8 }}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                Built with Modern, Reliable Technology
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Powered by industry-leading tools and frameworks
              </Typography>
            </Box>
          </Fade>

          <Grid container spacing={4} justifyContent="center" alignItems="center">
            {technologies.map((tech, index) => (
              <Grid item xs={6} sm={4} md={2} key={index}>
                <Zoom in={isVisible["tech-stack"]} timeout={1200 + index * 100}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      p: 3,
                      borderRadius: 3,
                      background: alpha(theme.palette.background.paper, 0.5),
                      backdropFilter: "blur(10px)",
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        background: alpha(theme.palette.background.paper, 0.8),
                      },
                    }}
                  >
                    {tech.logo}
                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 500 }}>
                      {tech.name}
                    </Typography>
                  </Box>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Final CTA Section */}
      <Box
        id="cta"
        data-animate
        sx={{
          py: 12,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: "white",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
          <Fade in={isVisible.cta} timeout={1000}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: "2rem", md: "3rem" },
                  fontWeight: 700,
                  mb: 3,
                }}
              >
                Ready to Boost Your Team's Productivity?
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Join thousands of teams already using TaskFlow to streamline their workflow
              </Typography>
              <Button
                component={RouterLink}
                to="/auth"
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: "white",
                  color: "primary.main",
                  borderRadius: 3,
                  px: 6,
                  py: 2,
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                  "&:hover": {
                    bgcolor: "grey.100",
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Sign Up Now
              </Button>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 6,
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(20px)",
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <TaskIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                TaskFlow
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              © 2025 TaskFlow. All rights reserved.
            </Typography>
            <Box sx={{ display: "flex", gap: 3 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  cursor: "pointer",
                  "&:hover": { color: "primary.main" },
                }}
              >
                About
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  cursor: "pointer",
                  "&:hover": { color: "primary.main" },
                }}
              >
                Contact
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  cursor: "pointer",
                  "&:hover": { color: "primary.main" },
                }}
              >
                Privacy Policy
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default LandingPage