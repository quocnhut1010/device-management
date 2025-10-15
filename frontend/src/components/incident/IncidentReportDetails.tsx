import React, { useState, useEffect } from "react";
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
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Grow,
} from "@mui/material";
import {
  SwapHoriz as SwapIcon,
  ExpandMore as ExpandMoreIcon,
  Build as BuildIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  WarningAmberRounded,
  ErrorOutlineRounded,
  CheckCircleOutlineRounded,
} from "@mui/icons-material";
import { type IncidentReport, getStatusText, getStatusColor } from "../../services/incidentService";
import { formatInTimeZone } from "date-fns-tz";
import { vi } from "date-fns/locale";
import HistoryIcon from "@mui/icons-material/History";
import InfoIcon from "@mui/icons-material/Info";
import DeviceReplacementDialog from "../replacement/DeviceReplacementDialog";
import { getUserFromToken } from "../../services/auth";
import { repairService, type Repair, getRepairStatusText, getRepairStatusColor } from "../../services/repairService";

// 🎨 Device status color helper
const getDeviceStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "đang sử dụng":
    case "hoạt động":
      return "success";
    case "đang sửa chữa":
    case "bảo trì":
      return "warning";
    case "hỏng":
    case "không hoạt động":
      return "error";
    case "đã thay thế":
    case "thanh lý":
      return "default";
    default:
      return "info";
  }
};

export default function IncidentReportDetails({
  open,
  onClose,
  report,
  onReplacementSuccess,
}) {
  if (!report)
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent>
          <Typography variant="body2" color="textSecondary">
            Đang tải dữ liệu sự cố...
          </Typography>
        </DialogContent>
      </Dialog>
    );
  const [replacementDialogOpen, setReplacementDialogOpen] = useState(false);
  const [repairHistory, setRepairHistory] = useState<Repair[]>([]);
  const [loadingRepairs, setLoadingRepairs] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const currentUser = getUserFromToken();
  const isAdmin = currentUser?.role === "Admin";
  const isTechnician = currentUser?.position === "Kỹ thuật viên";
  const isNormalUser = !isAdmin && !isTechnician;
  

  // 🧩 Fetch repair history + analysis
  useEffect(() => {
        if (open && report?.device?.id) {
        setLoadingRepairs(true);
        setLoadingAnalysis(true);

        Promise.all([
          repairService.getDeviceRepairHistory(report.device.id),
          repairService.analyzeDeviceRepairHistory(report.device.id),
        ])
          .then(([history, analysisData]) => {
            setRepairHistory(history);
            setAnalysis(analysisData);
          })
          .catch(console.error)
          .finally(() => {
            setLoadingRepairs(false);
            setLoadingAnalysis(false);
          });
      }
  }, [open, report?.device?.id]);

  const canReplaceDevice =
    (isAdmin || isTechnician) &&
    report.device?.id &&
    (report.status === 0 || report.status === 2) &&
    report.device.status !== "Đã thay thế";

  const handleReplacementSuccess = () => {
    setReplacementDialogOpen(false);
    onReplacementSuccess?.();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const utcDate = new Date(dateString.endsWith("Z") ? dateString : dateString + "Z");
      return formatInTimeZone(utcDate, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return dateString;
    }
  };

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "";

  // 🎯 Determine alert severity
  const getAlertLevel = () => {
    if (!analysis || !analysis.warnings) return "safe";
    const severe = analysis.warnings.some((w: string) =>
      w.toLowerCase().includes("vượt quá") || w.toLowerCase().includes("gần đây")
    );
    const mild = analysis.warnings.length > 0;
    if (severe) return "severe";
    if (mild) return "warning";
    return "safe";
  };

  const level = getAlertLevel();

  const alertConfig = {
    severe: {
      color: "#E53935",
      icon: <ErrorOutlineRounded sx={{ color: "#E53935" }} />,
      title: "⚠️ Cảnh báo nghiêm trọng",
    },
    warning: {
      color: "#FFA726",
      icon: <WarningAmberRounded sx={{ color: "#FFA726" }} />,
      title: "⚠️ Cảnh báo thiết bị",
    },
    safe: {
      color: "#43A047",
      icon: <CheckCircleOutlineRounded sx={{ color: "#43A047" }} />,
      title: "✅ Thiết bị hoạt động ổn định",
    },
  }[level];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>
            Chi tiết báo cáo sự cố
          </Typography>
          <Chip
            label={getStatusText(report?.status)}
            color={getStatusColor(report?.status) as any}
            variant="outlined"
            sx={{ fontWeight: "bold" }}
          />
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: "#fafafa" }}>
        {/* 🧠 PHÂN TÍCH THIẾT BỊ */}
         {report?.device?.id && (
          <Grow in timeout={700}>
            <Box mb={3}>
              {loadingAnalysis ? (
                <Box display="flex" alignItems="center" gap={2}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="textSecondary">
                    Đang phân tích thiết bị...
                  </Typography>
                </Box>
              ) : (
                analysis && (
                  <>
                    {/* ⚙️ Hiển thị đầy đủ cho Admin / Kỹ thuật viên */}
                    {(isAdmin || isTechnician) && (
                      <Card
                        variant="outlined"
                        sx={{
                          borderColor: alertConfig.color,
                          borderWidth: 2,
                          boxShadow: 1,
                          mb: 2,
                          bgcolor: "#fff",
                        }}
                      >
                        <CardContent>
                          <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                            {alertConfig.icon}
                            <Typography
                              variant="h6"
                              sx={{ color: alertConfig.color, fontWeight: 600 }}
                            >
                              {alertConfig.title}
                            </Typography>
                          </Box>
                          {analysis.warnings?.length > 0 ? (
                            <ul
                              style={{
                                marginTop: 0,
                                marginBottom: 8,
                                paddingLeft: 20,
                              }}
                            >
                              {analysis.warnings.map((warn: string, idx: number) => (
                                <li key={idx}>
                                  <Typography variant="body2">{warn}</Typography>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              Không phát hiện vấn đề bất thường trong lịch sử sửa chữa.
                            </Typography>
                          )}
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                            <strong>Gợi ý:</strong>{" "}
                            {analysis.suggestion || "Không có gợi ý cụ thể."}
                          </Typography>
                        </CardContent>
                      </Card>
                    )}

                    {/* 👀 Phiên bản rút gọn cho nhân viên thường */}
                    {isNormalUser && analysis.warnings?.length > 0 && (
                      <Card
                        variant="outlined"
                        sx={{
                          borderColor: "#ff9800",
                          borderWidth: 1.5,
                          boxShadow: 1,
                          mb: 2,
                          bgcolor: "#fffbea",
                        }}
                      >
                        <CardContent>
                          <Box display="flex" alignItems="center" gap={1}>
                            <InfoIcon color="warning" />
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 600, color: "#f57c00" }}
                            >
                              Thông tin thêm
                            </Typography>
                          </Box>
                          <Typography variant="body2" mt={1}>
                            Thiết bị của bạn đã từng được sửa chữa hoặc bảo trì trước đây.
                          </Typography>
                          <Typography variant="body2" color="textSecondary" mt={0.5}>
                            Nếu gặp vấn đề tương tự, vui lòng liên hệ kỹ thuật viên để được hỗ trợ.
                          </Typography>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )
              )}
            </Box>
          </Grow>
        )}

        {/* 🧩 THÔNG TIN CHI TIẾT */}
        <Grid container spacing={3}>
          {/* Thiết bị */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" color="primary">
                    Thông tin thiết bị
                  </Typography>
                  {report.device?.status && (
                    <Chip
                      label={report.device.status}
                      color={getDeviceStatusColor(report.device.status) as any}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Mã thiết bị
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {report.device?.deviceCode || "N/A"}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Tên thiết bị
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {report.device?.deviceName || "N/A"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Người báo cáo */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Người báo cáo
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Họ tên
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {report.reportedByUser?.fullName || "N/A"}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Email
                </Typography>
                <Typography variant="body1">
                  {report.reportedByUser?.email || "N/A"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Sự cố */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Chi tiết sự cố
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Loại sự cố
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {report.reportType}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Ngày báo cáo
                </Typography>
                <Typography variant="body1">{formatDate(report.reportDate)}</Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Mô tả chi tiết
                </Typography>
                <Box
                  sx={{
                    mt: 1,
                    p: 2,
                    bgcolor: "grey.50",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "grey.300",
                  }}
                >
                  <Typography variant="body1">{report.description}</Typography>
                </Box>
                {report.imageUrl && (
                  <Box
                    component="img"
                    src={`${baseUrl}${report.imageUrl}`}
                    alt="Hình ảnh sự cố"
                    sx={{
                      mt: 2,
                      maxWidth: "100%",
                      maxHeight: 300,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "grey.300",
                      cursor: "pointer",
                    }}
                    onClick={() => window.open(`${baseUrl}${report.imageUrl}`, "_blank")}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Accordion lịch sử sửa chữa */}
          {isAdmin && (
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" color="primary" display="flex" alignItems="center" gap={1}>
                    <BuildIcon /> Lịch sử sửa chữa thiết bị
                    {repairHistory.length > 0 && (
                      <Chip label={repairHistory.length} size="small" color="info" variant="outlined" />
                    )}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {loadingRepairs ? (
                    <Box display="flex" alignItems="center" gap={2} justifyContent="center" py={2}>
                      <CircularProgress size={22} />
                      <Typography variant="body2" color="textSecondary">
                        Đang tải lịch sử sửa chữa...
                      </Typography>
                    </Box>
                  ) : repairHistory.length === 0 ? (
                    <Typography variant="body2" color="textSecondary" textAlign="center" py={2}>
                      Thiết bị chưa có lịch sử sửa chữa nào.
                    </Typography>
                  ) : (
                    <List dense>
                      {repairHistory.map((repair, index) => (
                        <ListItem key={repair.id} divider={index < repairHistory.length - 1}>
                          <ListItemIcon>
                            <BuildIcon color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle2">Sửa chữa #{index + 1}</Typography>
                                <Chip
                                  label={getRepairStatusText(repair.status)}
                                  color={getRepairStatusColor(repair.status) as any}
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="textSecondary">
                                  <strong>Mô tả:</strong> {repair.description || "Không có mô tả"}
                                </Typography>
                                {repair.cost && (
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Chi phí:</strong>{" "}
                                    {repair.cost.toLocaleString("vi-VN")} VND
                                  </Typography>
                                )}
                                {repair.repairCompany && (
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Công ty sửa chữa:</strong> {repair.repairCompany}
                                  </Typography>
                                )}
                                {repair.technicianName && (
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Kỹ thuật viên:</strong> {repair.technicianName}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </AccordionDetails>
              </Accordion>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
        {isAdmin && (
          <Tooltip title={!canReplaceDevice ? "Thiết bị đã được thay thế hoặc không hợp lệ" : ""}>
            <span>
              <Button
                variant="contained"
                startIcon={<SwapIcon />}
                onClick={() => setReplacementDialogOpen(true)}
                color="primary"
                disabled={!canReplaceDevice}
              >
                Thay thế thiết bị
              </Button>
            </span>
          </Tooltip>
        )}
      </DialogActions>

      {/* Replacement dialog */}
      {report.device?.id && (
        <DeviceReplacementDialog
          open={replacementDialogOpen}
          onClose={() => setReplacementDialogOpen(false)}
          onSuccess={handleReplacementSuccess}
          deviceId={report.device.id}
          deviceCode={report.device.deviceCode || "N/A"}
          deviceName={report.device.deviceName || "N/A"}
          incidentReportId={report.id}
          title="Thay thế thiết bị từ sự cố"
        />
      )}
    </Dialog>
  );
}
