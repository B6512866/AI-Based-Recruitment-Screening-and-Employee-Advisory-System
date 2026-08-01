import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  message,
  Popconfirm,
  Row,
  Col,
  Typography,
  Tooltip,
  Alert,
  Rate,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  UndoOutlined,
  HolderOutlined,
  PieChartOutlined,
  StarFilled,
  FileTextOutlined,
} from "@ant-design/icons";

import {
  getJobCriteria,
  createJobCriteria,
  updateJobCriteria,
  deleteJobCriteria,
  getCriteriaOptions,
  createCriteriaOption,
  updateCriteriaOption,
  deleteCriteriaOption,
  JobCriteria,
} from "../../services/jobCriteriaService";

const { Title, Text } = Typography;

export interface JobCriteriaOption {
  ID: number;
  job_criteria_id?: number;
  name: string;
  level?: string;
  description?: string;
  condition?: string;
  score: number;
  is_active?: boolean;
}

interface Props {
  jobPositionId: number;
}

interface JobCriteriaWithDetails extends JobCriteria {
  options?: JobCriteriaOption[];
}

// 🎨 สีหลักสำหรับหลอดเกณฑ์ (Scale Bar)
const UNIFIED_COLOR = "#4f46e5";

// 🌈 ชุดสีสำหรับแยกสัดส่วน Pie / Donut Chart
const CHART_COLORS = [
  "#4f46e5", // Indigo
  "#06b6d4", // Cyan
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#14b8a6", // Teal
];

// Helper Function: คำนวณ Arc สำหรับ SVG Pie Chart
function getCoordinatesForPercent(percent: number) {
  const x = Math.cos(2 * Math.PI * percent);
  const y = Math.sin(2 * Math.PI * percent);
  return [x, y];
}

export default function JobCriteriaPage({ jobPositionId }: Props) {
  const [criteriaList, setCriteriaList] = useState<JobCriteriaWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  const [draggingOptionId, setDraggingOptionId] = useState<number | null>(null);
  const trackRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const [criteriaModalOpen, setCriteriaModalOpen] = useState<boolean>(false);
  const [editingCriteria, setEditingCriteria] = useState<JobCriteria | null>(null);
  const [criteriaForm] = Form.useForm();

  const [optionModalOpen, setOptionModalOpen] = useState<boolean>(false);
  const [selectedCriteriaId, setSelectedCriteriaId] = useState<number | null>(null);
  const [editingOption, setEditingOption] = useState<JobCriteriaOption | null>(null);
  const [optionForm] = Form.useForm();

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getJobCriteria(jobPositionId);
      const data: JobCriteria[] = res?.data ?? res ?? [];

      const fullData = await Promise.all(
        data.map(async (item) => {
          try {
            const optRes = await getCriteriaOptions(item.ID);
            const options: JobCriteriaOption[] = optRes?.data ?? optRes ?? [];
            options.sort((a, b) => a.score - b.score);
            return { ...item, options };
          } catch {
            return { ...item, options: [] };
          }
        })
      );

      setCriteriaList(fullData);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Load Criteria Error:", error);
      message.error("ไม่สามารถโหลดข้อมูลเกณฑ์การประเมินได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobPositionId) {
      loadData();
    }
  }, [jobPositionId]);

  const totalWeight = criteriaList.reduce((sum, item) => sum + (item.weight ?? 0), 0);

  const handleStarChange = (criteriaId: number, starValue: number) => {
    const calculatedWeight = starValue * 10;
    setCriteriaList((prev) =>
      prev.map((item) => (item.ID === criteriaId ? { ...item, weight: calculatedWeight } : item))
    );
    setHasUnsavedChanges(true);
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, optionId: number) => {
    e.stopPropagation();
    setDraggingOptionId(optionId);
  };

  const handleMouseMove = (
    e: MouseEvent | TouchEvent,
    criteriaId: number,
    max_score: number
  ) => {
    if (!draggingOptionId) return;

    const trackElem = trackRefs.current[criteriaId];
    if (!trackElem) return;

    const rect = trackElem.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;

    let offsetX = clientX - rect.left;
    offsetX = Math.max(0, Math.min(offsetX, rect.width));

    const percent = offsetX / rect.width;
    const calculatedScore = Math.round(percent * max_score);

    setCriteriaList((prevList) =>
      prevList.map((crit) => {
        if (crit.ID !== criteriaId) return crit;
        return {
          ...crit,
          options: crit.options?.map((opt) => {
            if (opt.ID === draggingOptionId && opt.score !== calculatedScore) {
              setHasUnsavedChanges(true);
              return { ...opt, score: calculatedScore };
            }
            return opt;
          }),
        };
      })
    );
  };

  const handleMouseUp = () => {
    setDraggingOptionId(null);
  };

  useEffect(() => {
    const activeCriteria = criteriaList.find((c) =>
      c.options?.some((o) => o.ID === draggingOptionId)
    );

    if (!activeCriteria || !draggingOptionId) return;

    const max_score = activeCriteria.max_score || 10;

    const onMove = (e: MouseEvent | TouchEvent) =>
      handleMouseMove(e, activeCriteria.ID, max_score);

    const onUp = () => handleMouseUp();

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [draggingOptionId, criteriaList]);

  const handleSaveAllChanges = async () => {
    try {
      setSaving(true);
      const updatePromises: Promise<any>[] = [];

      criteriaList.forEach((crit) => {
        updatePromises.push(
          updateJobCriteria(crit.ID, {
            name: crit.name,
            description: crit.description || "",
            weight: crit.weight ?? 0,
            max_score: crit.max_score ?? 10,
            is_required: crit.is_required ?? true,
          })
        );
        crit.options?.forEach((opt) => {
          const payload = {
            name: opt.name,
            description: opt.description || opt.condition || "",
            score: opt.score,
            is_active: opt.is_active ?? true,
          };
          updatePromises.push(updateCriteriaOption(opt.ID, payload));
        });
      });

      await Promise.all(updatePromises);
      message.success("บันทึกการตั้งค่าเรียบร้อยแล้ว");
      setHasUnsavedChanges(false);
      await loadData();
    } catch (error) {
      console.error("Save Error:", error);
      message.error("บันทึกข้อมูลไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenCriteriaModal = (criteria?: JobCriteria) => {
    if (criteria) {
      setEditingCriteria(criteria);
      criteriaForm.setFieldsValue({
        name: criteria.name,
        description: criteria.description || "",
        max_score: criteria.max_score ?? 10,
        is_required: criteria.is_required ?? true,
      });
    } else {
      setEditingCriteria(null);
      criteriaForm.resetFields();
      criteriaForm.setFieldsValue({ max_score: 10, is_required: true });
    }
    setCriteriaModalOpen(true);
  };

  const handleSaveCriteria = async () => {
    try {
      const values = await criteriaForm.validateFields();
      
      const payload = {
        name: values.name,
        description: values.description || "",
        weight: editingCriteria ? (editingCriteria.weight ?? 0) : 0,
        max_score: values.max_score ?? 10,
        is_required: values.is_required ?? true,
      };

      if (editingCriteria) {
        await updateJobCriteria(editingCriteria.ID, payload);
        message.success("อัปเดตคุณสมบัติเรียบร้อยแล้ว");
      } else {
        await createJobCriteria(jobPositionId, payload);
        message.success("สร้างคุณสมบัติใหม่เรียบร้อยแล้ว");
      }
      setCriteriaModalOpen(false);
      await loadData();
    } catch (error) {
      console.error("Save Criteria Error:", error);
      message.error("บันทึกคุณสมบัติไม่สำเร็จ");
    }
  };

  const handleDeleteCriteria = async (id: number) => {
    try {
      await deleteJobCriteria(id);
      message.success("ลบคุณสมบัติเรียบร้อยแล้ว");
      await loadData();
    } catch (error) {
      message.error("ไม่สามารถลบคุณสมบัติได้");
    }
  };

  const handleOpenOptionModal = (criteriaId: number, option?: JobCriteriaOption) => {
    setSelectedCriteriaId(criteriaId);
    if (option) {
      setEditingOption(option);
      const conditionText = option.condition || option.description || "";
      optionForm.setFieldsValue({
        name: option.name,
        level: option.level || option.name,
        score: option.score,
        condition: conditionText,
        is_active: option.is_active ?? true,
      });
    } else {
      setEditingOption(null);
      optionForm.resetFields();
      optionForm.setFieldsValue({ score: 1, is_active: true });
    }
    setOptionModalOpen(true);
  };

  const handleSaveOption = async () => {
    try {
      const values = await optionForm.validateFields();
      if (!selectedCriteriaId && !editingOption) return;

      const payload = {
        name: values.name,
        description: values.condition || "",
        score: values.score,
        is_active: values.is_active ?? true,
      };

      if (editingOption) {
        await updateCriteriaOption(editingOption.ID, payload);
        message.success("อัปเดตเกณฑ์ย่อยเรียบร้อยแล้ว");
      } else {
        await createCriteriaOption(selectedCriteriaId!, payload);
        message.success("เพิ่มเกณฑ์ย่อยเรียบร้อยแล้ว");
      }
      setOptionModalOpen(false);
      await loadData();
    } catch (error) {
      console.error("Save Option Error:", error);
      message.error("บันทึกเกณฑ์ย่อยไม่สำเร็จ");
    }
  };

  const handleDeleteOption = async (optionId: number) => {
    try {
      await deleteCriteriaOption(optionId);
      message.success("ลบเกณฑ์ย่อยเรียบร้อยแล้ว");
      await loadData();
    } catch (error) {
      message.error("ไม่สามารถลบเกณฑ์ย่อยได้");
    }
  };

  // 🥧 Component สำหรับวาด SVG Pie Chart พร้อมแสดงตัวเลข % บนชิ้นส่วน
  const renderSvgPieChart = () => {
    const validItems = criteriaList.filter((item) => (item.weight ?? 0) > 0);
    const currentTotal = validItems.reduce((sum, item) => sum + (item.weight ?? 0), 0);

    if (currentTotal === 0) {
      return (
        <div style={{ width: 180, height: 180, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Text type="secondary" style={{ fontSize: "12px" }}>ยังไม่มีน้ำหนัก</Text>
        </div>
      );
    }

    let cumulativePercent = 0;

    const slices = validItems.map((item) => {
      const weight = item.weight ?? 0;
      const percent = weight / currentTotal;
      const startPercent = cumulativePercent;
      cumulativePercent += percent;
      const endPercent = cumulativePercent;

      const [startX, startY] = getCoordinatesForPercent(startPercent - 0.25);
      const [endX, endY] = getCoordinatesForPercent(endPercent - 0.25);

      const largeArcFlag = percent > 0.5 ? 1 : 0;

      const pathData = percent === 1
        ? `M 0 -1 A 1 1 0 1 1 -0.0001 -1 L 0 0 Z`
        : `M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0 Z`;

      const midPercent = startPercent + percent / 2 - 0.25;
      const labelRadius = 0.65;
      const labelX = Math.cos(2 * Math.PI * midPercent) * labelRadius;
      const labelY = Math.sin(2 * Math.PI * midPercent) * labelRadius;

      const originalIndex = criteriaList.findIndex((c) => c.ID === item.ID);
      const color = CHART_COLORS[originalIndex % CHART_COLORS.length];

      return {
        id: item.ID,
        name: item.name,
        weight,
        percentDisplay: Math.round((weight / (totalWeight || 1)) * 100),
        pathData,
        color,
        labelX,
        labelY,
        showLabel: percent > 0.04,
      };
    });

    return (
      <div style={{ position: "relative", width: 180, height: 180 }}>
        <svg viewBox="-1.1 -1.1 2.2 2.2" style={{ transform: "rotate(0deg)", width: "100%", height: "100%" }}>
          {slices.map((slice) => (
            <Tooltip key={slice.id} title={`${slice.name}: ${slice.weight}%`}>
              <path d={slice.pathData} fill={slice.color} stroke="#ffffff" strokeWidth="0.02" />
            </Tooltip>
          ))}

          {slices.map(
            (slice) =>
              slice.showLabel && (
                <text
                  key={`label-${slice.id}`}
                  x={slice.labelX}
                  y={slice.labelY}
                  fill="#ffffff"
                  fontSize="0.18"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {slice.percentDisplay}%
                </text>
              )
          )}
        </svg>
      </div>
    );
  };

  // Render Modern Scale Bar (ใช้สีเดียว)
  const renderModernScaleBar = (criteria: JobCriteriaWithDetails) => {
    const options = [...(criteria.options ?? [])].sort((a, b) => a.score - b.score);
    const max_score = criteria.max_score && criteria.max_score > 0 ? criteria.max_score : 10;

    return (
      <div
        style={{
          padding: "40px 20px 65px 20px",
          width: "100%",
          background: "#fafafa",
          borderRadius: "12px",
          border: "1px solid #f0f0f0",
          marginTop: "16px",
          userSelect: "none",
        }}
      >
        <div
          ref={(el) => {
            trackRefs.current[criteria.ID] = el;
          }}
          style={{ position: "relative", width: "100%", height: "16px", display: "flex", alignItems: "center" }}
        >
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "8px",
              background: "#e2e8f0",
              borderRadius: "4px",
            }}
          />

          {options.length > 0 && (
            <div
              style={{
                position: "absolute",
                left: 0,
                width: `${Math.min((options[options.length - 1].score / max_score) * 100, 100)}%`,
                height: "8px",
                background: UNIFIED_COLOR,
                borderRadius: "4px",
                transition: "width 0.2s ease-out",
              }}
            />
          )}

          <div style={{ position: "absolute", left: "0", top: "-24px", fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>
            0
          </div>
          <div style={{ position: "absolute", right: "0", top: "-24px", fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>
            เต็ม ({max_score})
          </div>

          {options.map((opt, index) => {
            const rawPercent = (opt.score / max_score) * 100;
            const leftPercent = Math.min(Math.max(rawPercent, 3), 97);
            const isDragging = draggingOptionId === opt.ID;

            const prevOpt = options[index - 1];
            const isTooClose = prevOpt && Math.abs(opt.score - prevOpt.score) < max_score * 0.12;
            const cardOffsetTop = isTooClose && index % 2 !== 0 ? 65 : 36;

            const tooltipContent = opt.condition || opt.description ? `${opt.name}: ${opt.condition || opt.description}` : `ปรับคะแนน (${opt.score} / ${max_score})`;

            return (
              <div
                key={opt.ID}
                style={{
                  position: "absolute",
                  left: `${leftPercent}%`,
                  transform: "translateX(-50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  zIndex: isDragging ? 10 : 3,
                  transition: isDragging ? "none" : "left 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)",
                }}
              >
                <Tooltip title={tooltipContent}>
                  <div
                    onMouseDown={(e) => handleMouseDown(e, opt.ID)}
                    onTouchStart={(e) => handleMouseDown(e, opt.ID)}
                    style={{
                      position: "absolute",
                      bottom: "24px",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      backgroundColor: isDragging ? UNIFIED_COLOR : "#ffffff",
                      border: `1.5px solid ${UNIFIED_COLOR}`,
                      color: isDragging ? "#ffffff" : UNIFIED_COLOR,
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                      fontWeight: 600,
                      fontSize: "12px",
                      boxShadow: isDragging ? "0 4px 10px rgba(0,0,0,0.15)" : "0 1px 3px rgba(0,0,0,0.05)",
                      cursor: isDragging ? "grabbing" : "grab",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <HolderOutlined style={{ fontSize: "10px", opacity: 0.6 }} />
                    {opt.score} / {max_score} คะแนน
                  </div>
                </Tooltip>

                <div
                  onMouseDown={(e) => handleMouseDown(e, opt.ID)}
                  onTouchStart={(e) => handleMouseDown(e, opt.ID)}
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    backgroundColor: "#ffffff",
                    border: `3px solid ${UNIFIED_COLOR}`,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    cursor: "grab",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    top: "14px",
                    width: "1px",
                    height: `${cardOffsetTop - 14}px`,
                    backgroundColor: isDragging ? UNIFIED_COLOR : "#cbd5e1",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    top: `${cardOffsetTop}px`,
                    whiteSpace: "nowrap",
                    textAlign: "center",
                    backgroundColor: "#ffffff",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    maxWidth: "130px",
                  }}
                >
                  <Tooltip title={opt.name}>
                    <Text strong style={{ fontSize: "11px", color: "#334155", display: "block", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {opt.name}
                    </Text>
                  </Tooltip>

                  <Space size={0}>
                    <Button
                      type="text"
                      size="small"
                      style={{ padding: "0 2px", height: "auto" }}
                      icon={<EditOutlined style={{ fontSize: "10px", color: "#64748b" }} />}
                      onClick={() => handleOpenOptionModal(criteria.ID, opt)}
                    />
                    <Popconfirm title="ลบเกณฑ์ย่อยนี้?" onConfirm={() => handleDeleteOption(opt.ID)} okText="ลบ" cancelText="ยกเลิก">
                      <Button type="text" size="small" danger style={{ padding: "0 2px", height: "auto" }} icon={<DeleteOutlined style={{ fontSize: "10px" }} />} />
                    </Popconfirm>
                  </Space>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: "right", marginTop: "70px" }}>
          <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={() => handleOpenOptionModal(criteria.ID)}>
            เพิ่มเกณฑ์ย่อย
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1100px", margin: "0 auto", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {hasUnsavedChanges && (
        <Alert
          message={
            <Row justify="space-between" align="middle">
              <Col>
                <Text strong style={{ color: "#451a03" }}>
                  มีการปรับเปลี่ยนน้ำหนักหรือเกณฑ์คะแนน
                </Text>
                <Text type="secondary" style={{ marginLeft: 8, fontSize: "12px" }}>
                  อย่าลืมกดบันทึกเพื่ออัปเดตข้อมูล
                </Text>
              </Col>
              <Col>
                <Space>
                  <Button size="small" icon={<UndoOutlined />} onClick={loadData} disabled={saving}>
                    ยกเลิก
                  </Button>
                  <Button
                    type="primary"
                    size="small"
                    icon={<SaveOutlined />}
                    loading={saving}
                    onClick={handleSaveAllChanges}
                    style={{ backgroundColor: UNIFIED_COLOR }}
                  >
                    บันทึกทั้งหมด
                  </Button>
                </Space>
              </Col>
            </Row>
          }
          type="warning"
          showIcon
          style={{ marginBottom: "16px", borderRadius: "8px" }}
        />
      )}

      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: "24px" }}>
        <Col>
          <Title level={4} style={{ margin: 0, color: "#0f172a" }}>
            จัดการเกณฑ์การประเมินผู้สมัคร
          </Title>
          <Text type="secondary" style={{ fontSize: "13px" }}>
            กำหนดน้ำหนักคะแนน (%) และเงื่อนไขย่อยสำหรับการคัดเลือก
          </Text>
        </Col>
        <Col>
          <Space>
            {hasUnsavedChanges && (
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving}
                onClick={handleSaveAllChanges}
                style={{ backgroundColor: "#10b981", borderColor: "#10b981" }}
              >
                บันทึกการเปลี่ยนแปลง
              </Button>
            )}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ backgroundColor: UNIFIED_COLOR, borderColor: UNIFIED_COLOR }}
              onClick={() => handleOpenCriteriaModal()}
            >
              สร้างคุณสมบัติใหม่
            </Button>
          </Space>
        </Col>
      </Row>

      {/* WEIGHT DISTRIBUTION PANEL WITH SVG PIE CHART */}
      <Card
        bordered={false}
        style={{
          borderRadius: "12px",
          marginBottom: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          background: "#ffffff",
        }}
        bodyStyle={{ padding: "20px" }}
      >
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Space align="center" size="small">
              <PieChartOutlined style={{ fontSize: "16px", color: UNIFIED_COLOR }} />
              <Text strong style={{ fontSize: "14px", color: "#1e293b" }}>
                สัดส่วนน้ำหนักคะแนน (Weight Distribution Pie Chart)
              </Text>
            </Space>
          </Col>
          <Col>
            <Tag
              bordered={false}
              color={totalWeight === 100 ? "success" : totalWeight > 100 ? "error" : "warning"}
              style={{ fontSize: "12px", borderRadius: "12px", fontWeight: 600 }}
            >
              รวมน้ำหนัก: {totalWeight}% / 100%
            </Tag>
          </Col>
        </Row>

        <Row gutter={[24, 20]} align="middle">
          {/* ส่วนแสดง SVG Pie Chart พร้อมเปอร์เซ็นต์บนกราฟ */}
          <Col xs={24} md={9} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {renderSvgPieChart()}
          </Col>

          {/* ส่วนรายการและสไลเดอร์ปรับดาว */}
          <Col xs={24} md={15}>
            <Row gutter={[12, 10]}>
              {criteriaList.map((crit, index) => {
                const starValue = (crit.weight ?? 0) / 10;
                const itemColor = CHART_COLORS[index % CHART_COLORS.length];

                return (
                  <Col xs={24} sm={12} key={crit.ID}>
                    <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                      <Row justify="space-between" align="middle" style={{ marginBottom: 4 }}>
                        <Text strong style={{ fontSize: "13px", color: "#334155" }} ellipsis={{ tooltip: crit.name }}>
                          <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", backgroundColor: itemColor, marginRight: 6 }} />
                          {crit.name}
                        </Text>
                        <Tag color={itemColor} bordered={false} style={{ margin: 0, fontWeight: 700, fontSize: "11px", color: "#fff" }}>
                          {crit.weight ?? 0}%
                        </Tag>
                      </Row>

                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Rate
                          allowHalf
                          count={10}
                          value={starValue}
                          onChange={(val) => handleStarChange(crit.ID, val)}
                          character={<StarFilled style={{ fontSize: "13px" }} />}
                          style={{ color: itemColor }}
                        />
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Criteria Cards */}
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        {criteriaList.map((criteria, index) => {
          const itemColor = CHART_COLORS[index % CHART_COLORS.length];
          const maxScore = criteria.max_score ?? 10;

          return (
            <Card
              key={criteria.ID}
              loading={loading}
              bordered={false}
              style={{ borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
              bodyStyle={{ padding: "20px" }}
            >
              <Row justify="space-between" align="middle">
                <Col>
                  <Space align="center" size="small">
                    <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", backgroundColor: itemColor }} />
                    <Text strong style={{ fontSize: "16px", color: "#0f172a" }}>
                      {criteria.name}
                    </Text>
                    {criteria.is_required ? (
                      <Tag bordered={false} color="red" style={{ fontSize: "11px" }}>จำเป็น</Tag>
                    ) : (
                      <Tag bordered={false} style={{ fontSize: "11px" }}>ทางเลือก</Tag>
                    )}
                    <Tag bordered={false} color="blue" style={{ fontSize: "11px" }}>เต็ม: {maxScore}</Tag>
                    <Tag bordered={false} style={{ fontSize: "11px", fontWeight: 600, backgroundColor: itemColor, color: "#fff" }}>
                      น้ำหนัก {criteria.weight ?? 0}%
                    </Tag>
                  </Space>

                  {criteria.description && (
                    <div style={{ marginTop: 4, paddingLeft: 18 }}>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {criteria.description}
                      </Text>
                    </div>
                  )}
                </Col>

                <Col>
                  <Space>
                    <Button size="small" type="text" icon={<EditOutlined />} onClick={() => handleOpenCriteriaModal(criteria)}>
                      แก้ไข
                    </Button>
                    <Popconfirm title="ยืนยันการลบคุณสมบัตินี้?" onConfirm={() => handleDeleteCriteria(criteria.ID)} okText="ลบ" cancelText="ยกเลิก">
                      <Button size="small" type="text" danger icon={<DeleteOutlined />}>
                        ลบ
                      </Button>
                    </Popconfirm>
                  </Space>
                </Col>
              </Row>

              {/* Scale Bar Component */}
              {renderModernScaleBar(criteria)}

              {/* รายละเอียดเงื่อนไข */}
              <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                <Space style={{ marginBottom: "8px" }}>
                  <FileTextOutlined style={{ color: "#64748b", fontSize: "12px" }} />
                  <Text strong style={{ fontSize: "12px", color: "#475569" }}>
                    เกณฑ์ย่อยและเงื่อนไขการให้คะแนน
                  </Text>
                </Space>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {criteria.options && criteria.options.length > 0 ? (
                    criteria.options.map((opt) => {
                      const conditionText = opt.condition || opt.description;

                      return (
                        <div
                          key={opt.ID}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px 12px",
                            backgroundColor: "#f8fafc",
                            borderRadius: "6px",
                            border: "1px solid #f1f5f9",
                          }}
                        >
                          <Space align="start" size="small">
                            <Tag bordered={false} color="blue" style={{ minWidth: "75px", textAlign: "center", fontWeight: 600, fontSize: "11px" }}>
                              {opt.score} / {maxScore} คะแนน
                            </Tag>
                            <div>
                              <Text strong style={{ fontSize: "12px", color: "#334155", display: "block" }}>
                                {opt.name} {opt.level && opt.level !== opt.name ? `(${opt.level})` : ""}
                              </Text>
                              {conditionText ? (
                                <Text type="secondary" style={{ fontSize: "11px", color: "#64748b" }}>
                                  {conditionText}
                                </Text>
                              ) : (
                                <Text type="secondary" italic style={{ fontSize: "11px" }}>
                                  ไม่มีคำอธิบายเงื่อนไข
                                </Text>
                              )}
                            </div>
                          </Space>

                          <Space size={0}>
                            <Button
                              type="text"
                              size="small"
                              icon={<EditOutlined style={{ fontSize: "11px", color: "#64748b" }} />}
                              onClick={() => handleOpenOptionModal(criteria.ID, opt)}
                            />
                            <Popconfirm title="ลบเกณฑ์ย่อยนี้?" onConfirm={() => handleDeleteOption(opt.ID)} okText="ลบ" cancelText="ยกเลิก">
                              <Button type="text" size="small" danger icon={<DeleteOutlined style={{ fontSize: "11px" }} />} />
                            </Popconfirm>
                          </Space>
                        </div>
                      );
                    })
                  ) : (
                    <Text type="secondary" italic style={{ fontSize: "11px" }}>
                      ยังไม่มีเกณฑ์ย่อยถูกกำหนดไว้
                    </Text>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </Space>

      {/* Modal 1: Main Criteria */}
      <Modal
        title={editingCriteria ? "แก้ไขคุณสมบัติหลัก" : "สร้างคุณสมบัติใหม่"}
        open={criteriaModalOpen}
        onOk={handleSaveCriteria}
        onCancel={() => setCriteriaModalOpen(false)}
        destroyOnClose
      >
        <Form form={criteriaForm} layout="vertical">
          <Form.Item label="ชื่อคุณสมบัติ" name="name" rules={[{ required: true, message: "กรุณาระบุชื่อคุณสมบัติ" }]}>
            <Input placeholder="เช่น วุฒิการศึกษา / ประสบการณ์การทดสอบซอฟต์แวร์" />
          </Form.Item>

          <Form.Item label="คำอธิบายเกณฑ์เพิ่มเติม" name="description">
            <Input.TextArea rows={3} placeholder="รายละเอียดขอบเขตการประเมิน" />
          </Form.Item>

          <Form.Item label="คะแนนเต็มของสเกล (Max Score)" name="max_score" rules={[{ required: true, message: "กรุณาระบุคะแนนเต็ม" }]}>
            <InputNumber min={1} style={{ width: "100%" }} placeholder="เช่น 10, 20, 100" />
          </Form.Item>

          <Form.Item label="ประเภทเกณฑ์" name="is_required" valuePropName="checked">
            <Switch checkedChildren="จำเป็น (Required)" unCheckedChildren="ทางเลือก (Optional)" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal 2: Criteria Option / Condition Edit */}
      <Modal
        title={editingOption ? "แก้ไขเกณฑ์ย่อย / เงื่อนไข" : "เพิ่มเกณฑ์ย่อยใหม่"}
        open={optionModalOpen}
        onOk={handleSaveOption}
        onCancel={() => setOptionModalOpen(false)}
        destroyOnClose
      >
        <Form form={optionForm} layout="vertical">
          <Form.Item label="ชื่อระดับ / ชื่อเกณฑ์ย่อย" name="name" rules={[{ required: true, message: "กรุณาระบุชื่อเกณฑ์ย่อย" }]}>
            <Input placeholder="เช่น Excellent, Good, Fair, Poor" />
          </Form.Item>

          <Form.Item label="ระดับ (Level)" name="level">
            <Input placeholder="เช่น Level 1, Senior" />
          </Form.Item>

          <Form.Item label="คะแนนที่ได้" name="score" rules={[{ required: true, message: "กรุณาระบุคะแนน" }]}>
            <InputNumber min={0} style={{ width: "100%" }} placeholder="ระบุตัวเลขคะแนน" />
          </Form.Item>

          <Form.Item label="เงื่อนไขการให้คะแนนแบบละเอียด" name="condition">
            <Input.TextArea rows={3} placeholder="รายละเอียดเงื่อนไข..." />
          </Form.Item>

          <Form.Item label="สถานะเปิดใช้งาน" name="is_active" valuePropName="checked">
            <Switch checkedChildren="เปิดใช้งาน" unCheckedChildren="ปิดใช้งาน" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}