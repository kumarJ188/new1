import { Alert, Box, Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import {
  useApproveMemberMutation,
  useMyCommunitiesQuery,
  usePendingMembersQuery,
  useRejectMemberMutation,
} from "@state/api";

export default function MembershipApprovals() {
  const { data: myC } = useMyCommunitiesQuery();
  const [communityId, setCommunityId] = useState("");

  const pendingQ = usePendingMembersQuery(communityId, { skip: !communityId });
  const [approve] = useApproveMemberMutation();
  const [reject] = useRejectMemberMutation();

  const rows = (pendingQ.data?.memberships || []).map((m) => ({
    id: m.user?._id,
    name: m.user?.name,
    email: m.user?.email,
    requestedAt: m.createdAt,
  }));

  const columns = useMemo(
    () => [
      { field: "name", headerName: "Name", flex: 1 },
      { field: "email", headerName: "Email", flex: 1 },
      {
        field: "requestedAt",
        headerName: "Requested",
        flex: 0.8,
        valueGetter: (p) => new Date(p.value).toLocaleString(),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 220,
        sortable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="contained"
              onClick={() => approve({ communityId, memberId: params.row.id })}
            >
              Approve
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => reject({ communityId, memberId: params.row.id })}
            >
              Reject
            </Button>
          </Stack>
        ),
      },
    ],
    [approve, reject, communityId]
  );

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={700} mb={1}>Membership approvals</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Community admins (and super admin) can approve membership requests.
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2} alignItems={{ sm: "center" }}>
        <TextField
          select
          label="Select community"
          value={communityId}
          onChange={(e) => setCommunityId(e.target.value)}
          sx={{ minWidth: 320 }}
        >
          {(myC?.communities || []).map((c) => (
            <MenuItem key={c._id} value={c._id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {pendingQ.error ? <Alert severity="error" sx={{ mb: 2 }}>{pendingQ.error?.data?.message || "Failed"}</Alert> : null}

      <Box height="70vh">
        <DataGrid rows={rows} columns={columns} loading={pendingQ.isLoading} disableRowSelectionOnClick />
      </Box>
    </Box>
  );
}
