import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Chip, Stack, Alert } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import { useCreateCommunityMutation, useListCommunitiesQuery, useRequestJoinMutation } from "@state/api";
import { useNavigate } from "react-router-dom";

export default function Communities() {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useListCommunitiesQuery();
  const [createCommunity] = useCreateCommunityMutation();
  const [requestJoin] = useRequestJoinMutation();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [description, setDescription] = useState("");
  const [createError, setCreateError] = useState("");

  const rows = (data?.communities || []).map((c) => ({
    id: c._id,
    name: c.name,
    status: c.status,
    region: c.region || "",
    keywords: (c.keywords || []).join(", "),
  }));

  const columns = useMemo(
    () => [
      { field: "name", headerName: "Community", flex: 1 },
      { field: "region", headerName: "Region", flex: 0.6 },
      {
        field: "keywords",
        headerName: "Keywords",
        flex: 1,
      },
      {
        field: "actions",
        headerName: "Actions",
        sortable: false,
        width: 260,
        renderCell: (params) => (
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" onClick={() => navigate(`/communities/${params.row.id}`)}>
              Open
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={async () => {
                await requestJoin(params.row.id);
                refetch();
              }}
            >
              Request Join
            </Button>
          </Stack>
        ),
      },
    ],
    [navigate, requestJoin, refetch]
  );

  const onCreate = async () => {
    setCreateError("");
    try {
      const payload = {
        name,
        keywords: keywords
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        description,
      };
      await createCommunity(payload).unwrap();
      setOpen(false);
      setName("");
      setKeywords("");
      setDescription("");
      refetch();
    } catch (e) {
      setCreateError(e?.data?.message || "Failed to create community");
    }
  };

  return (
    <Box p={3}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2} mb={2}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Communities</Typography>
          <Typography variant="body2" color="text.secondary">Browse approved communities and request membership.</Typography>
        </Box>
        <Button variant="contained" onClick={() => setOpen(true)}>Create Community</Button>
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error?.data?.message || "Failed to load"}</Alert> : null}

      <Box height="65vh">
        <DataGrid
          loading={isLoading}
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
        />
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create community (will be pending until Super Admin approves)</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          {createError ? <Alert severity="error">{createError}</Alert> : null}
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Keywords (comma separated)" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
          <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} multiline minRows={3} />
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {keywords
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
              .slice(0, 8)
              .map((k) => (
                <Chip key={k} label={k} size="small" />
              ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={onCreate} disabled={!name.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
