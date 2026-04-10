import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Badge,
} from "@mui/material";

const groups: string[] = [
  "(IT) 2023 June Batch - 3 rd Year",
  "Developers",
  "Design Team",
  "Project Group",
  "DSA",
  "ITPM Group",
  "University Events",
];

const GroupList = (): React.ReactElement => {
  return (
    <Box
      sx={{
        width: "89%",
        maxWidth: "100%",
        bgcolor: "#f8fafc",
        borderRadius: 3,
        boxShadow: 1,
        p: 2,
        margin: "10px auto",
      }}
    >
      <Typography
        sx={{
          p: 2,
          fontWeight: "bold",
          color: "#0f172a",
          fontSize: "18px",
        }}
      >
        Groups
      </Typography>

      <List>
        {groups.map((group, index) => {
          const isHighlighted = group === "(IT) 2023 June Batch - 3 rd Year";

          return (
            <ListItem
              key={index}
              sx={{
                borderRadius: 2,
                mb: 1,
                border: isHighlighted ? "1px solid #3b82f6" : "1px solid transparent",
                bgcolor: isHighlighted ? "#dbeafe" : "transparent",
                "&:hover": {
                  bgcolor: isHighlighted ? "#dbeafe" : "#e2e8f0",
                  borderColor: isHighlighted ? "#3b82f6" : "#93c5fd",
                },
                cursor: "pointer",
              }}
            >
              <ListItemAvatar>
                <Badge
                  color="success"
                  variant="dot"
                  overlap="circular"
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                >
                  <Avatar sx={{ bgcolor: "#0ea5e9" }}>{group.charAt(0)}</Avatar>
                </Badge>
              </ListItemAvatar>

              <ListItemText
                primary={
                  <Typography fontWeight="600" color="#0f172a">
                    {group}
                  </Typography>
                }
                secondary={
                  <Typography fontSize="12px" color="#64748b">
                    Last message preview...
                  </Typography>
                }
              />

              <Typography fontSize="11px" color="#94a3b8">
                12:45 PM
              </Typography>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default GroupList;
