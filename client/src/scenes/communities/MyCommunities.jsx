import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useMemo } from "react";
import { useMyCommunitiesQuery } from "@state/api";
import { useNavigate } from "react-router-dom";

export default function MyCommunities() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useMyCommunitiesQuery();

  const rows = (data?.communities || []).map((c) => ({
    id: c._id,
    name: c.name,
    status: c.status,
    region: c.region || "",
  }));

  const columns = useMemo(
    () => [
      { field: "name", headerName: "Community", flex: 1 },
      { field: "region", headerName: "Region", flex: 0.7 },
      { field: "status", headerName: "Status", flex: 0.5 },
      {
        field: "open",
        headerName: "",
        width: 140,
        sortable: false,
        renderCell: (params) => (
          <Button size="small" variant="outlined" onClick={() => navigate(`/communities/${params.row.id}`)}>
            Open
          </Button>
        ),
      },
    ],
    [navigate]
  );

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={700} mb={1}>My communities</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Communities where your membership is approved.
      </Typography>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error?.data?.message || "Failed"}</Alert> : null}

      <Box height="70vh">
        <DataGrid rows={rows} columns={columns} loading={isLoading} disableRowSelectionOnClick />
      </Box>
    </Box>
  );
}
