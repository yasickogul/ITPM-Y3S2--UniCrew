import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";

const HelpPage = (): React.ReactElement => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Card
        sx={{
          width: 600,
          borderRadius: 3,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        <CardContent>
          {/* HEADER */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
            }}
          >
            <IconButton
              onClick={() => navigate("/chat")}
              sx={{ color: "#0f172a" }}
            >
              <ArrowBackIcon />
            </IconButton>

            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Help & Support
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* FAQ SECTION */}
          <Typography sx={{ fontWeight: "bold", mb: 1 }}>
            Frequently Asked Questions
          </Typography>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>How do I join a group?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              Click on a group from the left sidebar and start chatting instantly.
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>How do I change my settings?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              Go to Settings page and update your profile information.
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>How do I reset password?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              Use the “Change Password” section in Settings.
            </AccordionDetails>
          </Accordion>

          <Divider sx={{ my: 3 }} />

          {/* CONTACT SUPPORT */}
          <Typography sx={{ fontWeight: "bold", mb: 1 }}>
            Contact Support
          </Typography>

          <TextField fullWidth label="Your Email" sx={{ mb: 2 }} />

          <TextField
            fullWidth
            label="Message"
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />

          <Button
            fullWidth
            variant="contained"
            sx={{
              bgcolor: "#3b82f6",
              "&:hover": { bgcolor: "#2563eb" },
            }}
          >
            Send Message
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default HelpPage;
