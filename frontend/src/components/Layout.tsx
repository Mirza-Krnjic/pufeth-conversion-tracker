import { AppBar, Toolbar, Typography, Container, Box } from "@mui/material";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Container
        component="main"
        maxWidth="lg"
        sx={{ mt: 2, mb: 4, flexGrow: 1 }}
      >
        <AppBar
          position="static"
          elevation={1}
          sx={{
            mb: 4,
            background: "linear-gradient(90deg, #1a237e, #3949ab, #5c6bc0)",
          }}
        >
          <Toolbar>
            <Typography variant="h6" component="div">
              PufETH Conversion Tracker
            </Typography>
          </Toolbar>
        </AppBar>
        {children}
      </Container>
    </Box>
  );
};
