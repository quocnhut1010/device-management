"use client"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Chip,
  Card,
  CardContent,
  Box,
  Divider,
  Alert,
  AlertTitle,
} from "@mui/material"
import { type IncidentReport, getStatusText, getStatusColor } from "../../services/incidentService"
// import { format } from 'date-fns';
// import { vi } from 'date-fns/locale';
import { formatInTimeZone } from "date-fns-tz"
import { vi } from "date-fns/locale"
import HistoryIcon from "@mui/icons-material/History"

interface IncidentReportDetailsProps {
  open: boolean
  onClose: () => void
  report: IncidentReport | null
}

export default function IncidentReportDetails({ open, onClose, report }: IncidentReportDetailsProps) {
  if (!report) return null

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    try {
      // Ép luôn coi input là UTC
      const utcDate = new Date(dateString.endsWith("Z") ? dateString : dateString + "Z")
      return formatInTimeZone(utcDate, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm", { locale: vi })
    } catch {
      return dateString
    }
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ""

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Chi tiết báo cáo sự cố</Typography>
          <Chip
            label={getStatusText(report.status)}
            color={getStatusColor(report.status) as any}
            variant="outlined"
            sx={{ fontWeight: "bold" }}
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Thông tin thiết bị */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Thông tin thiết bị
                </Typography>
                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Mã thiết bị
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {report.device?.deviceCode || "N/A"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Tên thiết bị
                  </Typography>
                  <Typography variant="body1">{report.device?.deviceName || "N/A"}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Thông tin người báo cáo */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Người báo cáo
                </Typography>
                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Họ tên
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {report.reportedByUser?.fullName || "N/A"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{report.reportedByUser?.email || "N/A"}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Thông tin sự cố */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Chi tiết sự cố
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Loại sự cố
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {report.reportType}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Ngày báo cáo
                    </Typography>
                    <Typography variant="body1">{formatDate(report.reportDate)}</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Mô tả chi tiết
                    </Typography>
                    <Box
                      sx={{
                        mt: 1,
                        p: 2,
                        bgcolor: "grey.50",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="body1">{report.description}</Typography>
                    </Box>
                  </Grid>

                  {/* Hình ảnh nếu có */}
                  {report.imageUrl && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Hình ảnh
                      </Typography>
                      <Box
                        component="img"
                        src={`${baseUrl}${report.imageUrl}`}
                        alt="Hình ảnh sự cố"
                        sx={{
                          maxWidth: "100%",
                          maxHeight: 300,
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: "grey.300",
                          cursor: "pointer",
                        }}
                        onClick={() => window.open(report.imageUrl, "_blank")}
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = "none"
                        }}
                      />
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Thông tin từ chối (nếu có) */}
          {report.rejectedReason && (
            <Grid item xs={12}>
              <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
                <AlertTitle>Lý do từ chối</AlertTitle>
                <Typography variant="body1">
                  <b>{report.rejectedReason}</b>
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Thời gian: <b>{formatDate(report.rejectedAt)}</b>
                </Typography>
              </Alert>
            </Grid>
          )}

          {/* Thông tin cập nhật */}
          {report.updatedAt && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="textSecondary" display="flex" alignItems="center" gap={0.5}>
                  <HistoryIcon fontSize="small" />
                  <b>Cập nhật lần cuối:</b> {formatDate(report.updatedAt)}
                </Typography>
                {report.updatedBy && (
                  <Typography variant="body2" color="textSecondary" sx={{ pl: 3 }}>
                    <b>Bởi:</b> {report.updatedBy}
                  </Typography>
                )}
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  )
}
