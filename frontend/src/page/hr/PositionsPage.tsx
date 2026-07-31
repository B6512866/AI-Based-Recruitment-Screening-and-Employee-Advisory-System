import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Popconfirm,
  Progress,
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
} from "antd/es/upload/interface";

import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileImageOutlined,
  PlusOutlined,
  RobotOutlined,
  SaveOutlined,
  SearchOutlined,
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
  createJobCriteria,
  deleteJobAnnouncement,
  deleteJobCriteria,
  getJobAnnouncements,
  getJobCriteria,
  type JobAnalysisResult,
  type JobAnnouncement,
  type JobCriteria,
  updateJobCriteria,
  uploadJobAnnouncement,
} from "../../services/jobAnnouncementService";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// =====================================================
// Types
// =====================================================

interface JobPosition {
  ID: number;

  title: string;
  description: string;
  criteria: string;

  department?: string;
  location?: string;
  salary?: string;

  type?: string;
  benefits?: string;

  contact_info?: string;

  status?: string;
}

interface JobFormData {
  title: string;
  description: string;
  criteria: string;

  department: string;
  location: string;
  salary: string;

  type: string;

  benefits: string;
  contact_info: string;

  status: string;
}

interface CriteriaFormData {
  name: string;
  description: string;
  weight: number;
  is_required: boolean;
}

// =====================================================
// Component
// =====================================================

export default function PositionsPage() {
  const [messageApi, contextHolder] =
    message.useMessage();

  // ===================================================
  // Jobs
  // ===================================================

  const [jobs, setJobs] =
    useState<JobPosition[]>([]);

  const [loadingJobs, setLoadingJobs] =
    useState(false);

  const [searchText, setSearchText] =
    useState("");

  // ===================================================
  // Job Modal
  // ===================================================

  const [jobModalOpen, setJobModalOpen] =
    useState(false);

  const [editingJob, setEditingJob] =
    useState<JobPosition | null>(null);

  const [savingJob, setSavingJob] =
    useState(false);

  const [jobForm] =
    Form.useForm<JobFormData>();

  // ===================================================
  // Detail Modal
  // ===================================================

  const [selectedJob, setSelectedJob] =
    useState<JobPosition | null>(null);

  const [detailModalOpen, setDetailModalOpen] =
    useState(false);

  // ===================================================
  // Announcement
  // ===================================================

  const [
    announcementModalOpen,
    setAnnouncementModalOpen,
  ] = useState(false);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [uploadFileList, setUploadFileList] =
    useState<UploadFile[]>([]);

  const [uploading, setUploading] =
    useState(false);

  const [analyzing, setAnalyzing] =
    useState(false);

  const [
    announcements,
    setAnnouncements,
  ] = useState<JobAnnouncement[]>([]);

  // ===================================================
  // Gemini Result
  // ===================================================

  const [analysisResult, setAnalysisResult] =
    useState<JobAnalysisResult | null>(
      null
    );

  const [
    analysisModalOpen,
    setAnalysisModalOpen,
  ] = useState(false);

  // ===================================================
  // Criteria
  // ===================================================

  const [criteria, setCriteria] =
    useState<JobCriteria[]>([]);

  const [loadingCriteria, setLoadingCriteria] =
    useState(false);

  const [
    criteriaModalOpen,
    setCriteriaModalOpen,
  ] = useState(false);

  const [
    editingCriteria,
    setEditingCriteria,
  ] = useState<JobCriteria | null>(
    null
  );

  const [
    savingCriteria,
    setSavingCriteria,
  ] = useState(false);

  const [criteriaForm] =
    Form.useForm<CriteriaFormData>();

  // ===================================================
  // Load Jobs
  // ===================================================

  async function loadJobs() {
    try {
      setLoadingJobs(true);

      const response =
        await getalljobs();

      setJobs(
        response.data ??
          response ??
          []
      );
    } catch (error) {
      console.error(error);

      messageApi.error(
        "ไม่สามารถโหลดตำแหน่งงานได้"
      );
    } finally {
      setLoadingJobs(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  // ===================================================
  // Filter
  // ===================================================

  const filteredJobs =
    useMemo(() => {
      const keyword =
        searchText
          .trim()
          .toLowerCase();

      if (!keyword) {
        return jobs;
      }

      return jobs.filter(
        (job) =>
          job.title
            ?.toLowerCase()
            .includes(keyword) ||
          job.department
            ?.toLowerCase()
            .includes(keyword) ||
          job.location
            ?.toLowerCase()
            .includes(keyword)
      );
    }, [
      jobs,
      searchText,
    ]);

  // ===================================================
  // Job Create
  // ===================================================

  function openCreateJob() {
    setEditingJob(null);

    jobForm.resetFields();

    jobForm.setFieldsValue({
      title: "",
      description: "",
      criteria: "",

      department: "",
      location: "",
      salary: "",

      type: "",
      benefits: "",
      contact_info: "",

      status: "เปิดรับสมัคร",
    });

    setJobModalOpen(true);
  }

  // ===================================================
  // Job Edit
  // ===================================================

  function openEditJob(
    job: JobPosition
  ) {
    setEditingJob(job);

    jobForm.setFieldsValue({
      title: job.title ?? "",
      description:
        job.description ?? "",

      criteria:
        job.criteria ?? "",

      department:
        job.department ?? "",

      location:
        job.location ?? "",

      salary:
        job.salary ?? "",

      type:
        job.type ?? "",

      benefits:
        job.benefits ?? "",

      contact_info:
        job.contact_info ?? "",

      status:
        job.status ??
        "เปิดรับสมัคร",
    });

    setJobModalOpen(true);
  }

  // ===================================================
  // Save Job
  // ===================================================

  async function handleSaveJob() {
    try {
      const values =
        await jobForm.validateFields();

      setSavingJob(true);

      if (editingJob) {
        await updatejob(
          editingJob.ID,

          values.title,
          values.description,
          values.criteria,

          values.department,
          values.location,
          values.salary,

          values.type,

          values.benefits,
          values.contact_info,

          values.status
        );

        messageApi.success(
          "แก้ไขตำแหน่งงานสำเร็จ"
        );
      } else {
        await createjob(
          values.title,
          values.description,
          values.criteria,

          values.department,
          values.location,
          values.salary,

          values.type,

          values.benefits,
          values.contact_info,

          values.status
        );

        messageApi.success(
          "สร้างตำแหน่งงานสำเร็จ"
        );
      }

      setJobModalOpen(false);

      await loadJobs();
    } catch (error) {
      console.error(error);

      messageApi.error(
        "ไม่สามารถบันทึกตำแหน่งงานได้"
      );
    } finally {
      setSavingJob(false);
    }
  }

  // ===================================================
  // Delete Job
  // ===================================================

  async function handleDeleteJob(
    id: number
  ) {
    try {
      await deletejob(id);

      messageApi.success(
        "ลบตำแหน่งงานสำเร็จ"
      );

      await loadJobs();
    } catch (error) {
      console.error(error);

      messageApi.error(
        "ไม่สามารถลบตำแหน่งงานได้"
      );
    }
  }

  // ===================================================
  // Open Detail
  // ===================================================

  async function openJobDetail(
    job: JobPosition
  ) {
    setSelectedJob(job);

    setDetailModalOpen(true);

    await Promise.all([
      loadAnnouncements(
        job.ID
      ),

      loadCriteria(
        job.ID
      ),
    ]);
  }

  // ===================================================
  // Load Announcement
  // ===================================================

  async function loadAnnouncements(
    jobId: number
  ) {
    try {
      const response =
        await getJobAnnouncements(
          jobId
        );

      setAnnouncements(
        response.data ??
          response ??
          []
      );
    } catch (error) {
      console.error(error);

      setAnnouncements([]);
    }
  }

  // ===================================================
  // Upload Modal
  // ===================================================

  function openUploadModal() {
    setSelectedFile(null);

    setUploadFileList([]);

    setAnnouncementModalOpen(
      true
    );
  }

  // ===================================================
  // Upload + Analyze
  // ===================================================

  async function handleUploadAndAnalyze() {
    if (!selectedJob) {
      return;
    }

    if (!selectedFile) {
      messageApi.warning(
        "กรุณาเลือกไฟล์ประกาศงาน"
      );

      return;
    }

    try {
      setUploading(true);

      const uploadResponse =
        await uploadJobAnnouncement(
          selectedJob.ID,
          selectedFile
        );

      const announcement =
        uploadResponse.data ??
        uploadResponse;

      const announcementId =
        announcement.ID ??
        announcement.id;

      if (!announcementId) {
        throw new Error(
          "ไม่พบ ID ของประกาศงาน"
        );
      }

      setUploading(false);

      setAnalyzing(true);

      const analyzeResponse =
        await analyzeJobAnnouncement(
          announcementId
        );

      const result =
        analyzeResponse.data ??
        analyzeResponse;

      setAnalysisResult(
        result
      );

      setAnnouncementModalOpen(
        false
      );

      setAnalysisModalOpen(
        true
      );

      messageApi.success(
        "Gemini วิเคราะห์ประกาศงานสำเร็จ"
      );

      await Promise.all([
        loadAnnouncements(
          selectedJob.ID
        ),

        loadCriteria(
          selectedJob.ID
        ),
      ]);
    } catch (error: any) {
      console.error(error);

      const errorMessage =
        error?.response
          ?.data
          ?.error ??
        "อัปโหลดหรือวิเคราะห์ประกาศไม่สำเร็จ";

      messageApi.error(
        errorMessage
      );
    } finally {
      setUploading(false);

      setAnalyzing(false);
    }
  }

  // ===================================================
  // Delete Announcement
  // ===================================================

  async function handleDeleteAnnouncement(
    announcementId: number
  ) {
    if (!selectedJob) {
      return;
    }

    try {
      await deleteJobAnnouncement(
        announcementId
      );

      messageApi.success(
        "ลบประกาศงานสำเร็จ"
      );

      await loadAnnouncements(
        selectedJob.ID
      );
    } catch (error) {
      console.error(error);

      messageApi.error(
        "ไม่สามารถลบประกาศงานได้"
      );
    }
  }

  // ===================================================
  // Criteria
  // ===================================================

  async function loadCriteria(
    jobId: number
  ) {
    try {
      setLoadingCriteria(true);

      const response =
        await getJobCriteria(
          jobId
        );

      setCriteria(
        response.data ??
          response ??
          []
      );
    } catch (error) {
      console.error(error);

      setCriteria([]);
    } finally {
      setLoadingCriteria(false);
    }
  }

  // ===================================================
  // Open Create Criteria
  // ===================================================

  function openCreateCriteria() {
    setEditingCriteria(
      null
    );

    criteriaForm.resetFields();

    criteriaForm.setFieldsValue({
      name: "",
      description: "",
      weight: 0,
      is_required: false,
    });

    setCriteriaModalOpen(
      true
    );
  }

  // ===================================================
  // Open Edit Criteria
  // ===================================================

  function openEditCriteria(
    item: JobCriteria
  ) {
    setEditingCriteria(
      item
    );

    criteriaForm.setFieldsValue({
      name: item.name,

      description:
        item.description,

      weight:
        item.weight,

      is_required:
        item.is_required,
    });

    setCriteriaModalOpen(
      true
    );
  }

  // ===================================================
  // Save Criteria
  // ===================================================

  async function handleSaveCriteria() {
    if (!selectedJob) {
      return;
    }

    try {
      const values =
        await criteriaForm.validateFields();

      setSavingCriteria(
        true
      );

      if (editingCriteria) {
        await updateJobCriteria(
          editingCriteria.ID,
          values
        );

        messageApi.success(
          "แก้ไขเกณฑ์สำเร็จ"
        );
      } else {
        await createJobCriteria(
          selectedJob.ID,
          values
        );

        messageApi.success(
          "เพิ่มเกณฑ์สำเร็จ"
        );
      }

      setCriteriaModalOpen(
        false
      );

      await loadCriteria(
        selectedJob.ID
      );
    } catch (error) {
      console.error(error);

      messageApi.error(
        "ไม่สามารถบันทึกเกณฑ์ได้"
      );
    } finally {
      setSavingCriteria(
        false
      );
    }
  }

  // ===================================================
  // Delete Criteria
  // ===================================================

  async function handleDeleteCriteria(
    criteriaId: number
  ) {
    if (!selectedJob) {
      return;
    }

    try {
      await deleteJobCriteria(
        criteriaId
      );

      messageApi.success(
        "ลบเกณฑ์สำเร็จ"
      );

      await loadCriteria(
        selectedJob.ID
      );
    } catch (error) {
      console.error(error);

      messageApi.error(
        "ไม่สามารถลบเกณฑ์ได้"
      );
    }
  }

  // ===================================================
  // Weight
  // ===================================================

  const totalWeight =
    criteria.reduce(
      (total, item) =>
        total +
        Number(
          item.weight ?? 0
        ),
      0
    );

  // ===================================================
  // Table
  // ===================================================

  const columns = [
    {
      title: "ตำแหน่งงาน",

      dataIndex: "title",

      key: "title",

      render: (
        value: string
      ) => (
        <Text strong>
          {value}
        </Text>
      ),
    },

    {
      title: "แผนก",

      dataIndex:
        "department",

      key:
        "department",

      render: (
        value: string
      ) =>
        value ||
        "-",
    },

    {
      title:
        "สถานที่",

      dataIndex:
        "location",

      key:
        "location",

      render: (
        value: string
      ) =>
        value ||
        "-",
    },

    {
      title:
        "สถานะ",

      dataIndex:
        "status",

      key:
        "status",

      render: (
        value: string
      ) => (
        <Tag
          color={
            value ===
            "เปิดรับสมัคร"
              ? "green"
              : "default"
          }
        >
          {value ||
            "ไม่ระบุ"}
        </Tag>
      ),
    },

    {
      title:
        "จัดการ",

      key:
        "action",

      width:
        220,

      render: (
        _: unknown,
        record: JobPosition
      ) => (
        <Space>
          <Button
            type="primary"
            icon={
              <EyeOutlined />
            }
            onClick={() =>
              openJobDetail(
                record
              )
            }
          >
            รายละเอียด
          </Button>

          <Button
            icon={
              <EditOutlined />
            }
            onClick={() =>
              openEditJob(
                record
              )
            }
          />

          <Popconfirm
            title="ยืนยันการลบ"
            description="ต้องการลบตำแหน่งงานนี้หรือไม่?"
            okText="ลบ"
            cancelText="ยกเลิก"
            onConfirm={() =>
              handleDeleteJob(
                record.ID
              )
            }
          >
            <Button
              danger
              icon={
                <DeleteOutlined />
              }
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ===================================================
  // UI
  // ===================================================

  return (
    <>
      {contextHolder}

      <div
        style={{
          padding: 24,
        }}
      >
        <Card>
          <Row
            gutter={[
              16,
              16,
            ]}
            align="middle"
          >
            <Col
              xs={24}
              md={14}
            >
              <Title
                level={2}
                style={{
                  margin: 0,
                }}
              >
                จัดการตำแหน่งงาน
              </Title>

              <Text
                type="secondary"
              >
                สร้างตำแหน่งงาน
                อัปโหลดประกาศ
                วิเคราะห์ด้วย
                Gemini
                และจัดการเกณฑ์ประเมิน
              </Text>
            </Col>

            <Col
              xs={24}
              md={10}
              style={{
                textAlign:
                  "right",
              }}
            >
              <Button
                type="primary"
                size="large"
                icon={
                  <PlusOutlined />
                }
                onClick={
                  openCreateJob
                }
              >
                เพิ่มตำแหน่งงาน
              </Button>
            </Col>
          </Row>

          <Divider />

          <Row
            gutter={16}
          >
            <Col
              xs={24}
              md={8}
            >
              <Statistic
                title="ตำแหน่งงานทั้งหมด"
                value={
                  jobs.length
                }
              />
            </Col>

            <Col
              xs={24}
              md={8}
            >
              <Statistic
                title="เปิดรับสมัคร"
                value={
                  jobs.filter(
                    (job) =>
                      job.status ===
                      "เปิดรับสมัคร"
                  ).length
                }
              />
            </Col>

            <Col
              xs={24}
              md={8}
            >
              <Statistic
                title="ปิดรับสมัคร"
                value={
                  jobs.filter(
                    (job) =>
                      job.status ===
                      "ปิดรับสมัคร"
                  ).length
                }
              />
            </Col>
          </Row>

          <Divider />

          <Input
            size="large"
            prefix={
              <SearchOutlined />
            }
            placeholder="ค้นหาชื่อตำแหน่ง แผนก หรือสถานที่"
            value={
              searchText
            }
            onChange={(
              event
            ) =>
              setSearchText(
                event
                  .target
                  .value
              )
            }
            style={{
              maxWidth: 500,
              marginBottom: 20,
            }}
          />

          <Table
            rowKey="ID"
            columns={
              columns
            }
            dataSource={
              filteredJobs
            }
            loading={
              loadingJobs
            }
            pagination={{
              pageSize: 8,
            }}
            scroll={{
              x: 900,
            }}
          />
        </Card>
      </div>

      {/* ============================================ */}
      {/* Job Modal */}
      {/* ============================================ */}

      <Modal
        title={
          editingJob
            ? "แก้ไขตำแหน่งงาน"
            : "เพิ่มตำแหน่งงาน"
        }
        open={
          jobModalOpen
        }
        onCancel={() =>
          setJobModalOpen(
            false
          )
        }
        onOk={
          handleSaveJob
        }
        confirmLoading={
          savingJob
        }
        okText="บันทึก"
        cancelText="ยกเลิก"
        width={850}
      >
        <Form
          form={
            jobForm
          }
          layout="vertical"
        >
          <Row
            gutter={16}
          >
            <Col
              xs={24}
              md={12}
            >
              <Form.Item
                name="title"
                label="ชื่อตำแหน่ง"
                rules={[
                  {
                    required:
                      true,

                    message:
                      "กรุณาระบุชื่อตำแหน่ง",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col
              xs={24}
              md={12}
            >
              <Form.Item
                name="department"
                label="แผนก"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row
            gutter={16}
          >
            <Col
              xs={24}
              md={12}
            >
              <Form.Item
                name="location"
                label="สถานที่ทำงาน"
              >
                <Input />
              </Form.Item>
            </Col>

            <Col
              xs={24}
              md={12}
            >
              <Form.Item
                name="salary"
                label="เงินเดือน"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row
            gutter={16}
          >
            <Col
              xs={24}
              md={12}
            >
              <Form.Item
                name="type"
                label="ประเภทงาน"
              >
                <Input />
              </Form.Item>
            </Col>

            <Col
              xs={24}
              md={12}
            >
              <Form.Item
                name="status"
                label="สถานะ"
              >
                <Select
                  options={[
                    {
                      label:
                        "เปิดรับสมัคร",

                      value:
                        "เปิดรับสมัคร",
                    },

                    {
                      label:
                        "ปิดรับสมัคร",

                      value:
                        "ปิดรับสมัคร",
                    },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="รายละเอียดงาน"
          >
            <TextArea
              rows={4}
            />
          </Form.Item>

          <Form.Item
            name="criteria"
            label="คุณสมบัติหรือเกณฑ์เบื้องต้น"
          >
            <TextArea
              rows={4}
            />
          </Form.Item>

          <Form.Item
            name="benefits"
            label="สวัสดิการ"
          >
            <TextArea
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="contact_info"
            label="ข้อมูลติดต่อ"
          >
            <TextArea
              rows={2}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* ============================================ */}
      {/* Job Detail */}
      {/* ============================================ */}

      <Modal
        title={
          selectedJob
            ? `รายละเอียด: ${selectedJob.title}`
            : "รายละเอียดตำแหน่ง"
        }
        open={
          detailModalOpen
        }
        onCancel={() =>
          setDetailModalOpen(
            false
          )
        }
        footer={null}
        width={1200}
      >
        {selectedJob && (
          <>
            <Row
              gutter={16}
            >
              <Col
                xs={24}
                lg={10}
              >
                <Card
                  title="ข้อมูลตำแหน่งงาน"
                >
                  <Paragraph>
                    <Text strong>
                      แผนก:
                    </Text>{" "}
                    {selectedJob.department ||
                      "-"}
                  </Paragraph>

                  <Paragraph>
                    <Text strong>
                      สถานที่:
                    </Text>{" "}
                    {selectedJob.location ||
                      "-"}
                  </Paragraph>

                  <Paragraph>
                    <Text strong>
                      เงินเดือน:
                    </Text>{" "}
                    {selectedJob.salary ||
                      "-"}
                  </Paragraph>

                  <Paragraph>
                    <Text strong>
                      รายละเอียด:
                    </Text>
                  </Paragraph>

                  <Paragraph>
                    {selectedJob.description ||
                      "-"}
                  </Paragraph>

                  <Button
                    type="primary"
                    size="large"
                    icon={
                      <UploadOutlined />
                    }
                    onClick={
                      openUploadModal
                    }
                    block
                  >
                    อัปโหลดประกาศงาน
                    และวิเคราะห์ด้วย
                    Gemini
                  </Button>
                </Card>

                <Card
                  title="ไฟล์ประกาศงาน"
                  style={{
                    marginTop: 16,
                  }}
                >
                  {announcements.length ===
                  0 ? (
                    <Empty
                      description="ยังไม่มีไฟล์ประกาศ"
                    />
                  ) : (
                    <List
                      dataSource={
                        announcements
                      }
                      renderItem={(
                        item
                      ) => (
                        <List.Item
                          actions={[
                            <Popconfirm
                              key="delete"
                              title="ลบไฟล์ประกาศ?"
                              onConfirm={() =>
                                handleDeleteAnnouncement(
                                  item.ID
                                )
                              }
                            >
                              <Button
                                danger
                                icon={
                                  <DeleteOutlined />
                                }
                              />
                            </Popconfirm>,
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <FileImageOutlined />
                            }
                            title={
                              item.file_name
                            }
                            description={
                              item.status ||
                              "อัปโหลดแล้ว"
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )}
                </Card>
              </Col>

              <Col
                xs={24}
                lg={14}
              >
                <Card
                  title="เกณฑ์ประเมินผู้สมัคร"
                  extra={
                    <Button
                      type="primary"
                      icon={
                        <PlusOutlined />
                      }
                      onClick={
                        openCreateCriteria
                      }
                    >
                      เพิ่มเกณฑ์
                    </Button>
                  }
                >
                  <Alert
                    type={
                      totalWeight ===
                      100
                        ? "success"
                        : "warning"
                    }
                    showIcon
                    message={`น้ำหนักรวม ${totalWeight}%`}
                    description={
                      totalWeight ===
                      100
                        ? "น้ำหนักรวมถูกต้อง พร้อมใช้วิเคราะห์ Resume"
                        : "ควรปรับน้ำหนักรวมให้เท่ากับ 100%"
                    }
                    style={{
                      marginBottom: 16,
                    }}
                  />

                  <Progress
                    percent={
                      Math.min(
                        totalWeight,
                        100
                      )
                    }
                    status={
                      totalWeight ===
                      100
                        ? "success"
                        : "active"
                    }
                    style={{
                      marginBottom: 16,
                    }}
                  />

                  {loadingCriteria ? (
                    <div
                      style={{
                        textAlign:
                          "center",

                        padding: 40,
                      }}
                    >
                      <Spin />
                    </div>
                  ) : criteria.length ===
                    0 ? (
                    <Empty
                      description="ยังไม่มีเกณฑ์ประเมิน"
                    />
                  ) : (
                    <List
                      dataSource={
                        criteria
                      }
                      renderItem={(
                        item
                      ) => (
                        <List.Item
                          actions={[
                            <Button
                              key="edit"
                              icon={
                                <EditOutlined />
                              }
                              onClick={() =>
                                openEditCriteria(
                                  item
                                )
                              }
                            />,

                            <Popconfirm
                              key="delete"
                              title="ลบเกณฑ์นี้?"
                              onConfirm={() =>
                                handleDeleteCriteria(
                                  item.ID
                                )
                              }
                            >
                              <Button
                                danger
                                icon={
                                  <DeleteOutlined />
                                }
                              />
                            </Popconfirm>,
                          ]}
                        >
                          <List.Item.Meta
                            title={
                              <Space>
                                <Text
                                  strong
                                >
                                  {
                                    item.name
                                  }
                                </Text>

                                <Tag
                                  color="blue"
                                >
                                  {
                                    item.weight
                                  }
                                  %
                                </Tag>

                                {item.is_required && (
                                  <Tag
                                    color="red"
                                  >
                                    จำเป็น
                                  </Tag>
                                )}
                              </Space>
                            }
                            description={
                              item.description
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )}
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Modal>

      {/* ============================================ */}
      {/* Upload Modal */}
      {/* ============================================ */}

      <Modal
        title="อัปโหลดประกาศงาน"
        open={
          announcementModalOpen
        }
        onCancel={() =>
          setAnnouncementModalOpen(
            false
          )
        }
        onOk={
          handleUploadAndAnalyze
        }
        confirmLoading={
          uploading ||
          analyzing
        }
        okText={
          analyzing
            ? "Gemini กำลังวิเคราะห์..."
            : uploading
            ? "กำลังอัปโหลด..."
            : "อัปโหลดและวิเคราะห์"
        }
        cancelText="ยกเลิก"
      >
        <Alert
          type="info"
          showIcon
          message="รองรับ JPG, JPEG และ PNG"
          description="ระบบจะส่งรูปประกาศไปให้ Gemini วิเคราะห์ และบันทึกเกณฑ์ประเมินลงฐานข้อมูล"
          style={{
            marginBottom: 16,
          }}
        />

        <Upload
          accept=".jpg,.jpeg,.png"
          maxCount={1}
          fileList={
            uploadFileList
          }
          beforeUpload={(
            file
          ) => {
            const allowed =
              [
                "image/jpeg",
                "image/png",
              ].includes(
                file.type
              );

            if (!allowed) {
              messageApi.error(
                "รองรับเฉพาะ JPG, JPEG และ PNG"
              );

              return Upload.LIST_IGNORE;
            }

            setSelectedFile(
              file
            );

            setUploadFileList(
              [
                {
                  uid:
                    file.uid,

                  name:
                    file.name,

                  status:
                    "done",
                },
              ]
            );

            return false;
          }}
          onRemove={() => {
            setSelectedFile(
              null
            );

            setUploadFileList(
              []
            );
          }}
        >
          <Button
            icon={
              <UploadOutlined />
            }
            block
          >
            เลือกรูปประกาศงาน
          </Button>
        </Upload>

        {(uploading ||
          analyzing) && (
          <div
            style={{
              textAlign:
                "center",

              marginTop: 24,
            }}
          >
            <Spin
              size="large"
            />

            <div
              style={{
                marginTop: 12,
              }}
            >
              {analyzing
                ? "Gemini กำลังอ่านและวิเคราะห์ประกาศ..."
                : "กำลังอัปโหลดไฟล์..."}
            </div>
          </div>
        )}
      </Modal>

      {/* ============================================ */}
      {/* Gemini Result */}
      {/* ============================================ */}

      <Modal
        title={
          <Space>
            <RobotOutlined />
            ผลการวิเคราะห์จาก
            Gemini
          </Space>
        }
        open={
          analysisModalOpen
        }
        onCancel={() =>
          setAnalysisModalOpen(
            false
          )
        }
        footer={
          <Button
            type="primary"
            icon={
              <SaveOutlined />
            }
            onClick={() =>
              setAnalysisModalOpen(
                false
              )
            }
          >
            ปิดและดูเกณฑ์ที่บันทึก
          </Button>
        }
        width={1100}
      >
        {analysisResult && (
          <>
            <Row
              gutter={16}
            >
              <Col
                xs={24}
                md={12}
              >
                <Card
                  size="small"
                  title="ข้อมูลตำแหน่ง"
                >
                  <Paragraph>
                    <Text strong>
                      ตำแหน่ง:
                    </Text>{" "}
                    {
                      analysisResult.title
                    }
                  </Paragraph>

                  <Paragraph>
                    <Text strong>
                      แผนก:
                    </Text>{" "}
                    {
                      analysisResult.department ||
                        "-"
                    }
                  </Paragraph>

                  <Paragraph>
                    <Text strong>
                      สถานที่:
                    </Text>{" "}
                    {
                      analysisResult.location ||
                        "-"
                    }
                  </Paragraph>

                  <Paragraph>
                    <Text strong>
                      ประเภทงาน:
                    </Text>{" "}
                    {
                      analysisResult.employment_type ||
                        "-"
                    }
                  </Paragraph>
                </Card>
              </Col>

              <Col
                xs={24}
                md={12}
              >
                <Card
                  size="small"
                  title="คุณสมบัติ"
                >
                  <Paragraph>
                    <Text strong>
                      การศึกษา:
                    </Text>{" "}
                    {
                      analysisResult.education ||
                        "-"
                    }
                  </Paragraph>

                  <Paragraph>
                    <Text strong>
                      ประสบการณ์:
                    </Text>{" "}
                    {
                      analysisResult.experience ||
                        "-"
                    }
                  </Paragraph>
                </Card>
              </Col>
            </Row>

            <Divider />

            <Row
              gutter={16}
            >
              <Col
                xs={24}
                md={12}
              >
                <Card
                  size="small"
                  title="Technical Skills"
                >
                  {analysisResult
                    .technical_skills
                    .map(
                      (
                        skill
                      ) => (
                        <Tag
                          key={
                            skill
                          }
                          color="blue"
                          style={{
                            marginBottom: 8,
                          }}
                        >
                          {
                            skill
                          }
                        </Tag>
                      )
                    )}
                </Card>
              </Col>

              <Col
                xs={24}
                md={12}
              >
                <Card
                  size="small"
                  title="Soft Skills"
                >
                  {analysisResult
                    .soft_skills
                    .map(
                      (
                        skill
                      ) => (
                        <Tag
                          key={
                            skill
                          }
                          color="green"
                          style={{
                            marginBottom: 8,
                          }}
                        >
                          {
                            skill
                          }
                        </Tag>
                      )
                    )}
                </Card>
              </Col>
            </Row>

            <Divider />

            <Card
              title="เกณฑ์ที่ Gemini สร้าง"
            >
              <List
                dataSource={
                  analysisResult.suggested_criteria
                }
                renderItem={(
                  item
                ) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text
                            strong
                          >
                            {
                              item.name
                            }
                          </Text>

                          <Tag
                            color="purple"
                          >
                            {
                              item.weight
                            }
                            %
                          </Tag>
                        </Space>
                      }
                      description={
                        item.description
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </>
        )}
      </Modal>

      {/* ============================================ */}
      {/* Criteria Modal */}
      {/* ============================================ */}

      <Modal
        title={
          editingCriteria
            ? "แก้ไขเกณฑ์"
            : "เพิ่มเกณฑ์"
        }
        open={
          criteriaModalOpen
        }
        onCancel={() =>
          setCriteriaModalOpen(
            false
          )
        }
        onOk={
          handleSaveCriteria
        }
        confirmLoading={
          savingCriteria
        }
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form
          form={
            criteriaForm
          }
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="ชื่อเกณฑ์"
            rules={[
              {
                required:
                  true,

                message:
                  "กรุณาระบุชื่อเกณฑ์",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="รายละเอียด"
          >
            <TextArea
              rows={4}
            />
          </Form.Item>

          <Form.Item
            name="weight"
            label="น้ำหนักคะแนน"
            rules={[
              {
                required:
                  true,

                message:
                  "กรุณาระบุน้ำหนัก",
              },
            ]}
          >
            <InputNumber
              min={0}
              max={100}
              addonAfter="%"
              style={{
                width:
                  "100%",
              }}
            />
          </Form.Item>

          <Form.Item
            name="is_required"
            label="สถานะ"
          >
            <Select
              options={[
                {
                  label:
                    "ไม่บังคับ",

                  value:
                    false,
                },

                {
                  label:
                    "เป็นคุณสมบัติจำเป็น",

                  value:
                    true,
                },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}