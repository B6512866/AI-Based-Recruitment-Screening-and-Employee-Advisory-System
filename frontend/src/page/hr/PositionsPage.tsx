import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";

import type {
  UploadFile,
  UploadProps,
} from "antd";

import {
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  RobotOutlined,
  SaveOutlined,
  SettingOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import {
  createjob,
  deletejob,
  getalljobs,
  updatejob,
} from "../../services/jobPositionService";

import {
  analyzeJobAnnouncement,
  uploadJobAnnouncement,
} from "../../services/jobAnnouncementService";

import JobCriteriaPage from "./JobCriteriaPage";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// =====================================================
// Types (อัปเดตให้ตรงกับ Backend Controller & Gemini Service)
// =====================================================

interface SuggestedRubric {
  level: string;
  condition: string;
  score: number;
}

interface SuggestedCriteria {
  category: string;
  title: string;
  description: string;
  suggestedRubric: SuggestedRubric[];
}

interface GeminiResult {
  title: string;
  department: string;
  location: string;
  employment_type: string;
  salary: string;
  description: string | string[];
  responsibilities: string | string[];
  requirements: string | string[];
  technical_skills: string | string[];
  soft_skills: string | string[];
  education: string;
  experience: string;
  suggestedCriteria: SuggestedCriteria[];
}

interface JobPosition {
  ID: number;
  title: string;
  department?: string;
  location?: string;
  salary?: string;
  type?: string;
  benefits?: string;
  contact_info?: string;
  description?: string;
  criteria?: string;
  status?: string;
  criteria_items?: unknown[];
}

interface JobFormValues {
  title: string;
  department?: string;
  location?: string;
  salary?: string;
  type?: string;
  benefits?: string;
  contact_info?: string;
  description?: string;
  criteria?: string;
  status?: string;
}

// =====================================================
// Helper Functions
// =====================================================

function convertToText(value: string | string[] | undefined): string {
  if (!value) return "";
  if (Array.isArray(value)) return value.join("\n");
  return value;
}

function convertToArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

// =====================================================
// Component
// =====================================================

export default function PositionsPage() {
  const [form] = Form.useForm<JobFormValues>();

  const [jobs, setJobs] = useState<JobPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosition | null>(null);

  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [criteriaModalOpen, setCriteriaModalOpen] = useState(false);

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadedAnnouncementID, setUploadedAnnouncementID] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);
  const [geminiResult, setGeminiResult] = useState<GeminiResult | null>(null);

  // Load Jobs
  async function loadJobs() {
    try {
      setLoading(true);
      const response = await getalljobs();
      const jobData = response?.data ?? response ?? [];
      setJobs(Array.isArray(jobData) ? jobData : []);
    } catch (error) {
      console.error("Load Jobs Error:", error);
      message.error("ไม่สามารถโหลดข้อมูลตำแหน่งงานได้");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  const statistics = useMemo(() => {
    const total = jobs.length;
    const opened = jobs.filter((job) => job.status === "เปิดรับสมัคร").length;
    const closed = jobs.filter((job) => job.status === "ปิดรับสมัครแล้ว").length;
    return { total, opened, closed };
  }, [jobs]);

  function resetModal() {
    form.resetFields();
    form.setFieldsValue({ status: "เปิดรับสมัคร" });
    setEditingJob(null);
    setGeminiResult(null);
    setFileList([]);
    setUploadedAnnouncementID(null);
    setPreviewOpen(false);
  }

  function openCreateModal() {
    resetModal();
    setModalOpen(true);
  }

  function openEditModal(job: JobPosition) {
    setEditingJob(job);
    setGeminiResult(null);
    setFileList([]);
    setUploadedAnnouncementID(null);

    form.setFieldsValue({
      title: job.title,
      department: job.department ?? "",
      location: job.location ?? "",
      salary: job.salary ?? "",
      type: job.type ?? "",
      benefits: job.benefits ?? "",
      contact_info: job.contact_info ?? "",
      description: job.description ?? "",
      criteria: job.criteria ?? "",
      status: job.status ?? "เปิดรับสมัคร",
    });

    setModalOpen(true);
  }

  async function createTemporaryJob(): Promise<JobPosition> {
    const values = form.getFieldsValue();
    if (!values.title || !values.title.trim()) {
      throw new Error("กรุณาระบุชื่อตำแหน่งงานก่อนอัปโหลดรูป");
    }

    const response = await createjob(
      values.title,
      values.description ?? "",
      values.criteria ?? "",
      values.department ?? "",
      values.location ?? "",
      values.salary ?? "",
      values.type ?? "",
      values.benefits ?? "",
      values.contact_info ?? "",
      values.status ?? "เปิดรับสมัคร"
    );

    const newJob = response?.data ?? response;
    if (!newJob || !newJob.ID) {
      throw new Error("Backend ไม่ส่ง ID ของตำแหน่งงานกลับมา");
    }

    setEditingJob(newJob);
    return newJob;
  }

  async function handleUpload(file: File) {
    try {
      setUploading(true);
      let currentJob = editingJob;

      if (!currentJob || !currentJob.ID) {
        currentJob = await createTemporaryJob();
        message.success("สร้างตำแหน่งงานชั่วคราวแล้ว");
      }

      const response = await uploadJobAnnouncement(currentJob.ID, file);
      const announcement = response?.data ?? response;

      if (!announcement || !announcement.ID) {
        throw new Error("Backend ไม่ส่ง ID ของประกาศงานกลับมา");
      }

      setUploadedAnnouncementID(announcement.ID);
      message.success("อัปโหลดรูปประกาศงานสำเร็จ");
      await loadJobs();
    } catch (error) {
      console.error("Upload Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "อัปโหลดประกาศงานไม่สำเร็จ";
      message.error(errorMessage);
      setFileList([]);
    } finally {
      setUploading(false);
    }
  }

  const uploadProps: UploadProps = {
    fileList,
    maxCount: 1,
    accept: ".jpg,.jpeg,.png",
    beforeUpload: async (file) => {
      setFileList([
        {
          uid: file.uid,
          name: file.name,
          status: "uploading",
          originFileObj: file,
        },
      ]);
      await handleUpload(file);
      return false;
    },
    onRemove: () => {
      setFileList([]);
      setUploadedAnnouncementID(null);
      return true;
    },
  };

  async function handleAnalyze() {
    if (!uploadedAnnouncementID) {
      message.warning("กรุณาอัปโหลดรูปประกาศงานก่อน");
      return;
    }

    const hideLoading = message.loading("Gemini กำลังวิเคราะห์ประกาศงาน (อาจใช้เวลา 15-30 วินาที)...", 0);

    try {
      setAnalyzing(true);
      const response = await analyzeJobAnnouncement(uploadedAnnouncementID);
      const result = response?.data ?? response;

      if (!result || !result.title) {
        throw new Error("ไม่พบข้อมูลผลวิเคราะห์จาก Gemini");
      }

      setGeminiResult(result as GeminiResult);

      form.setFieldsValue({
        title: result.title ?? "",
        department: result.department ?? "",
        location: result.location ?? "",
        salary: result.salary ?? "",
        type: result.employment_type ?? "",
        description: convertToText(result.description),
        criteria: convertToText(result.requirements),
      });

      setPreviewOpen(true);
      message.success("Gemini วิเคราะห์ประกาศงานสำเร็จ");
    } catch (error: any) {
      console.error("Gemini Analyze Error:", error);
      let errorMessage = "Gemini วิเคราะห์ประกาศงานไม่สำเร็จ";
      if (error?.code === "ECONNABORTED") {
        errorMessage = "การเชื่อมต่อหมดเวลา (Timeout) กรุณาลองใหม่อีกครั้ง";
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      message.error(errorMessage);
    } finally {
      hideLoading();
      setAnalyzing(false);
    }
  }

  async function handleSave() {
    try {
      const values = await form.validateFields();
      setSaving(true);

      if (editingJob?.ID) {
        await updatejob(
          editingJob.ID,
          values.title,
          values.description ?? "",
          values.criteria ?? "",
          values.department ?? "",
          values.location ?? "",
          values.salary ?? "",
          values.type ?? "",
          values.benefits ?? "",
          values.contact_info ?? "",
          values.status ?? "เปิดรับสมัคร"
        );
        message.success("บันทึกตำแหน่งงานสำเร็จ");
      } else {
        await createjob(
          values.title,
          values.description ?? "",
          values.criteria ?? "",
          values.department ?? "",
          values.location ?? "",
          values.salary ?? "",
          values.type ?? "",
          values.benefits ?? "",
          values.contact_info ?? "",
          values.status ?? "เปิดรับสมัคร"
        );
        message.success("สร้างตำแหน่งงานสำเร็จ");
      }

      setModalOpen(false);
      setPreviewOpen(false);
      resetModal();
      await loadJobs();
    } catch (error) {
      console.error("Save Error:", error);
      message.error("ไม่สามารถบันทึกตำแหน่งงานได้");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deletejob(id);
      message.success("ลบตำแหน่งงานสำเร็จ");
      await loadJobs();
    } catch (error) {
      console.error("Delete Error:", error);
      message.error("ไม่สามารถลบตำแหน่งงานได้");
    }
  }

  const columns = [
    {
      title: "ตำแหน่งงาน",
      key: "title",
      render: (_: unknown, record: JobPosition) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.title}</Text>
          <Text type="secondary">{record.department || "-"}</Text>
        </Space>
      ),
    },
    {
      title: "สถานที่",
      dataIndex: "location",
      key: "location",
      render: (val: string | undefined) => val || "-",
    },
    {
      title: "ประเภท",
      dataIndex: "type",
      key: "type",
      render: (val: string | undefined) => val || "-",
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (val: string | undefined) => (
        <Tag color={val === "เปิดรับสมัคร" ? "green" : "red"}>
          {val || "-"}
        </Tag>
      ),
    },
    {
      title: "จัดการ",
      key: "action",
      render: (_: unknown, record: JobPosition) => (
        <Space wrap>
          <Button icon={<EyeOutlined />} onClick={() => openEditModal(record)}>
            ดู / แก้ไข
          </Button>

          <Button
            type="primary"
            icon={<SettingOutlined />}
            onClick={() => {
              if (!record.ID) {
                message.error("ไม่พบ ID ของตำแหน่งงาน");
                return;
              }
              setSelectedJobId(record.ID);
              setCriteriaModalOpen(true);
            }}
          >
            จัดการเกณฑ์
          </Button>

          <Popconfirm
            title="ยืนยันการลบตำแหน่งงาน"
            description="ข้อมูลตำแหน่งงานและข้อมูลที่เกี่ยวข้องอาจถูกลบ"
            okText="ลบ"
            cancelText="ยกเลิก"
            onConfirm={() => handleDelete(record.ID)}
          >
            <Button danger icon={<DeleteOutlined />}>
              ลบ
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" gutter={[16, 16]}>
        <Col>
          <Title level={2} style={{ marginBottom: 4 }}>
            จัดการตำแหน่งงาน
          </Title>
          <Text type="secondary">
            อัปโหลดประกาศงาน {" → "} Gemini วิเคราะห์ {" → "} HR ตรวจสอบ {" → "} กำหนดเกณฑ์คะแนน
          </Text>
        </Col>
        <Col>
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={openCreateModal}>
            สร้างตำแหน่งงาน
          </Button>
        </Col>
      </Row>

      <Divider />

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="ตำแหน่งงานทั้งหมด" value={statistics.total} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="กำลังเปิดรับ" value={statistics.opened} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="ปิดรับสมัคร" value={statistics.closed} />
          </Card>
        </Col>
      </Row>

      <Divider />

      <Card>
        <Table
          rowKey="ID"
          loading={loading}
          columns={columns}
          dataSource={jobs}
          scroll={{ x: 1000 }}
          locale={{ emptyText: <Empty description="ยังไม่มีตำแหน่งงาน" /> }}
        />
      </Card>

      {/* Modal เพิ่ม/แก้ไขตำแหน่งงาน */}
      <Modal
        title={editingJob ? "แก้ไขตำแหน่งงาน" : "สร้างตำแหน่งงานใหม่"}
        open={modalOpen}
        width={1100}
        destroyOnClose
        onCancel={() => {
          setModalOpen(false);
          resetModal();
        }}
        footer={[
          <Button key="cancel" onClick={() => { setModalOpen(false); resetModal(); }}>
            ยกเลิก
          </Button>,
          <Button key="save" type="primary" loading={saving} icon={<SaveOutlined />} onClick={handleSave}>
            บันทึกตำแหน่งงาน
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Card size="small" title="ขั้นที่ 1: ข้อมูลเบื้องต้น">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="ชื่อตำแหน่งงาน"
                  name="title"
                  rules={[{ required: true, message: "กรุณาระบุชื่อตำแหน่งงาน" }]}
                >
                  <Input placeholder="เช่น Software Test Engineer" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="แผนก" name="department">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="สถานที่ทำงาน" name="location">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="เงินเดือน" name="salary">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="ประเภทการจ้าง" name="type">
                  <Select
                    placeholder="เลือกประเภท"
                    options={[
                      { label: "งานประจำ", value: "งานประจำ" },
                      { label: "สัญญาจ้าง", value: "สัญญาจ้าง" },
                      { label: "ฝึกงาน", value: "ฝึกงาน" },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="สถานะ" name="status">
                  <Select
                    options={[
                      { label: "เปิดรับสมัคร", value: "เปิดรับสมัคร" },
                      { label: "ปิดรับสมัครแล้ว", value: "ปิดรับสมัครแล้ว" },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Divider />

          <Card size="small" title="ขั้นที่ 2: อัปโหลดรูปประกาศงาน">
            <Paragraph type="secondary">
              รองรับไฟล์ JPG, JPEG และ PNG กรุณาระบุชื่อตำแหน่งงานก่อนอัปโหลด
            </Paragraph>

            <Upload {...uploadProps}>
              <Button loading={uploading} icon={<UploadOutlined />}>
                เลือกรูปประกาศงาน
              </Button>
              {uploadedAnnouncementID && <Tag color="green" style={{ marginLeft: 8 }}>อัปโหลดสำเร็จ</Tag>}
            </Upload>

            <Space style={{ marginTop: 16 }} wrap>
              <Button
                type="primary"
                icon={<RobotOutlined />}
                loading={analyzing}
                disabled={!uploadedAnnouncementID}
                onClick={handleAnalyze}
              >
                Gemini วิเคราะห์ประกาศงาน
              </Button>
            </Space>
          </Card>

          <Divider />

          <Card size="small" title="ขั้นที่ 3: ตรวจสอบและแก้ไขข้อมูล">
            <Form.Item label="รายละเอียดงาน" name="description">
              <TextArea rows={7} placeholder="Gemini จะนำรายละเอียดงานมาใส่ให้อัตโนมัติ" />
            </Form.Item>

            <Form.Item label="คุณสมบัติที่ต้องการ" name="criteria">
              <TextArea rows={7} placeholder="Gemini จะนำคุณสมบัติผู้สมัครมาใส่ให้อัตโนมัติ" />
            </Form.Item>

            <Form.Item label="สวัสดิการ" name="benefits">
              <TextArea rows={3} />
            </Form.Item>

            <Form.Item label="ข้อมูลติดต่อ" name="contact_info">
              <TextArea rows={3} />
            </Form.Item>
          </Card>

          {/* Gemini Suggested Criteria */}
          {geminiResult && (
            <>
              <Divider />
              <Card
                title={
                  <Space>
                    <RobotOutlined />
                    <span>เกณฑ์ที่ Gemini วิเคราะห์และสร้างอัตโนมัติ</span>
                  </Space>
                }
              >
                <Paragraph type="secondary">
                  Gemini ได้ประมวลผลและสร้างเกณฑ์พร้อมตัวเลือกคะแนน (Rubrics) ลงฐานข้อมูลเรียบร้อยแล้ว
                </Paragraph>

                <List
                  bordered
                  dataSource={geminiResult.suggestedCriteria ?? []}
                  renderItem={(item, index) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <Space>
                            <Text strong>{index + 1}. {item.title}</Text>
                            <Tag color="cyan">{item.category}</Tag>
                          </Space>
                        }
                        description={
                          <div>
                            <div>{item.description}</div>
                            <div style={{ marginTop: 8 }}>
                              <Text type="secondary" style={{ fontSize: 12 }}>ระดับการให้คะแนนที่สร้าง:</Text>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                                {item.suggestedRubric?.map((rubric, rIdx) => (
                                  <Tag key={rIdx} color="blue">
                                    {rubric.level} ({rubric.score} คะแนน): {rubric.condition}
                                  </Tag>
                                ))}
                              </div>
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </>
          )}
        </Form>
      </Modal>

      {/* Gemini Preview Modal */}
      <Modal
        title={
          <Space>
            <RobotOutlined />
            Gemini Analysis Preview
          </Space>
        }
        open={previewOpen}
        width={1000}
        onCancel={() => setPreviewOpen(false)}
        footer={[
          <Button key="back" onClick={() => setPreviewOpen(false)}>
            กลับไปแก้ไข
          </Button>,
          <Button
            key="confirm"
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => {
              setPreviewOpen(false);
              message.info("ตรวจสอบข้อมูลในฟอร์ม แล้วกดบันทึกตำแหน่งงาน");
            }}
          >
            ยืนยันข้อมูล
          </Button>,
        ]}
      >
        {geminiResult ? (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="ตำแหน่งงาน">{geminiResult.title || "-"}</Descriptions.Item>
              <Descriptions.Item label="สถานที่">{geminiResult.location || "-"}</Descriptions.Item>
              <Descriptions.Item label="แผนก">{geminiResult.department || "-"}</Descriptions.Item>
              <Descriptions.Item label="ประเภทงาน">{geminiResult.employment_type || "-"}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={5}>Technical Skills</Title>
            <Space wrap>
              {convertToArray(geminiResult.technical_skills).map((skill) => (
                <Tag color="blue" key={skill}>{skill}</Tag>
              ))}
            </Space>

            <Divider />

            <Title level={5}>Soft Skills</Title>
            <Space wrap>
              {convertToArray(geminiResult.soft_skills).map((skill) => (
                <Tag color="purple" key={skill}>{skill}</Tag>
              ))}
            </Space>

            <Divider />

            <Title level={5}>เกณฑ์การประเมินที่ถูกสร้างลงฐานข้อมูล</Title>
            <List
              bordered
              dataSource={geminiResult.suggestedCriteria ?? []}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{index + 1}. {item.title}</Text>
                        <Tag color="geekblue">{item.category}</Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <p>{item.description}</p>
                        <Space wrap>
                          {item.suggestedRubric?.map((rub, idx) => (
                            <Tag color="green" key={idx}>
                              {rub.level} - {rub.score} คะแนน ({rub.condition})
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </>
        ) : (
          <Spin />
        )}
      </Modal>

      {/* Criteria Modal */}
      <Modal
        title="จัดการเกณฑ์ประเมินผู้สมัคร"
        open={criteriaModalOpen}
        width={1200}
        footer={null}
        destroyOnClose
        onCancel={() => {
          setCriteriaModalOpen(false);
          setSelectedJobId(null);
        }}
      >
        {selectedJobId !== null ? (
          <JobCriteriaPage jobPositionId={selectedJobId} />
        ) : null}
      </Modal>
    </div>
  );
}