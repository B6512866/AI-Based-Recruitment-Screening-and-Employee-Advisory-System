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
  EditOutlined,
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

const {
  Title,
  Text,
  Paragraph,
} = Typography;

const {
  TextArea,
} = Input;

// =====================================================
// Types
// =====================================================

interface SuggestedCriteria {
  name: string;
  description: string;
  weight: number;
}

interface GeminiResult {
  title: string;
  department: string;
  location: string;
  employment_type: string;
  salary: string;

  description:
    | string
    | string[];

  responsibilities:
    | string
    | string[];

  requirements:
    | string
    | string[];

  technical_skills:
    | string
    | string[];

  soft_skills:
    | string
    | string[];

  education: string;

  experience: string;

  suggested_criteria:
    SuggestedCriteria[];
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

function convertToText(
  value:
    | string
    | string[]
    | undefined,
): string {
  if (!value) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.join("\n");
  }

  return value;
}

function convertToArray(
  value:
    | string
    | string[]
    | undefined,
): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  return value
    .split("\n")
    .map(
      (item) =>
        item.trim(),
    )
    .filter(Boolean);
}

// =====================================================
// Component
// =====================================================

export default function PositionsPage() {
  const [
    form,
  ] = Form.useForm<JobFormValues>();

  // ===================================================
  // Job Data
  // ===================================================

  const [
    jobs,
    setJobs,
  ] = useState<
    JobPosition[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  // ===================================================
  // Main Modal
  // ===================================================

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    previewOpen,
    setPreviewOpen,
  ] = useState(false);

  const [
    editingJob,
    setEditingJob,
  ] = useState<
    JobPosition
    | null
  >(null);

  // ===================================================
  // Criteria Modal
  // ===================================================

  const [
    selectedJobId,
    setSelectedJobId,
  ] = useState<
    number
    | null
  >(null);

  const [
    criteriaModalOpen,
    setCriteriaModalOpen,
  ] = useState(false);

  // ===================================================
  // Upload
  // ===================================================

  const [
    fileList,
    setFileList,
  ] = useState<
    UploadFile[]
  >([]);

  const [
    uploadedAnnouncementID,
    setUploadedAnnouncementID,
  ] = useState<
    number
    | null
  >(null);

  const [
    uploading,
    setUploading,
  ] = useState(false);

  // ===================================================
  // Gemini
  // ===================================================

  const [
    analyzing,
    setAnalyzing,
  ] = useState(false);

  const [
    geminiResult,
    setGeminiResult,
  ] = useState<
    GeminiResult
    | null
  >(null);

  // ===================================================
  // Load Jobs
  // ===================================================

  async function loadJobs() {
    try {
      setLoading(true);

      const response =
        await getalljobs();

      const jobData =
        response?.data ??
        response ??
        [];

      setJobs(
        Array.isArray(
          jobData,
        )
          ? jobData
          : [],
      );
    } catch (
      error
    ) {
      console.error(
        "Load Jobs Error:",
        error,
      );

      message.error(
        "ไม่สามารถโหลดข้อมูลตำแหน่งงานได้",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  // ===================================================
  // Statistics
  // ===================================================

  const statistics =
    useMemo(() => {
      const total =
        jobs.length;

      const opened =
        jobs.filter(
          (job) =>
            job.status ===
            "เปิดรับสมัคร",
        ).length;

      const closed =
        jobs.filter(
          (job) =>
            job.status ===
            "ปิดรับสมัครแล้ว",
        ).length;

      return {
        total,
        opened,
        closed,
      };
    }, [
      jobs,
    ]);

  // ===================================================
  // Reset Modal
  // ===================================================

  function resetModal() {
    form.resetFields();

    form.setFieldsValue({
      status:
        "เปิดรับสมัคร",
    });

    setEditingJob(
      null,
    );

    setGeminiResult(
      null,
    );

    setFileList(
      [],
    );

    setUploadedAnnouncementID(
      null,
    );

    setPreviewOpen(
      false,
    );
  }

  // ===================================================
  // Open Create Modal
  // ===================================================

  function openCreateModal() {
    resetModal();

    setModalOpen(
      true,
    );
  }

  // ===================================================
  // Open Edit Modal
  // ===================================================

  function openEditModal(
    job: JobPosition,
  ) {
    setEditingJob(
      job,
    );

    setGeminiResult(
      null,
    );

    setFileList(
      [],
    );

    setUploadedAnnouncementID(
      null,
    );

    form.setFieldsValue({
      title:
        job.title,

      department:
        job.department ??
        "",

      location:
        job.location ??
        "",

      salary:
        job.salary ??
        "",

      type:
        job.type ??
        "",

      benefits:
        job.benefits ??
        "",

      contact_info:
        job.contact_info ??
        "",

      description:
        job.description ??
        "",

      criteria:
        job.criteria ??
        "",

      status:
        job.status ??
        "เปิดรับสมัคร",
    });

    setModalOpen(
      true,
    );
  }

  // ===================================================
  // Create Temporary Job
  // ===================================================

  async function createTemporaryJob():
    Promise<
      JobPosition
    > {

    const values =
      form.getFieldsValue();

    if (
      !values.title ||
      !values.title.trim()
    ) {
      throw new Error(
        "กรุณาระบุชื่อตำแหน่งงานก่อนอัปโหลดรูป",
      );
    }

    const response =
      await createjob(
        values.title,
        values.description ??
          "",
        values.criteria ??
          "",
        values.department ??
          "",
        values.location ??
          "",
        values.salary ??
          "",
        values.type ??
          "",
        values.benefits ??
          "",
        values.contact_info ??
          "",
        values.status ??
          "เปิดรับสมัคร",
      );

    const newJob =
      response?.data ??
      response;

    if (
      !newJob ||
      !newJob.ID
    ) {
      throw new Error(
        "Backend ไม่ส่ง ID ของตำแหน่งงานกลับมา",
      );
    }

    setEditingJob(
      newJob,
    );

    return newJob;
  }

  // ===================================================
  // Upload Announcement
  // ===================================================

  async function handleUpload(
    file: File,
  ) {
    try {
      setUploading(
        true,
      );

      let currentJob =
        editingJob;

      // -----------------------------------------------
      // ถ้ายังไม่มี Job ให้สร้างก่อน
      // -----------------------------------------------

      if (
        !currentJob ||
        !currentJob.ID
      ) {
        currentJob =
          await createTemporaryJob();

        message.success(
          "สร้างตำแหน่งงานชั่วคราวแล้ว",
        );
      }

      const jobID =
        currentJob.ID;

      // -----------------------------------------------
      // Upload Image
      // -----------------------------------------------

      const response =
        await uploadJobAnnouncement(
          jobID,
          file,
        );

      const announcement =
        response?.data ??
        response;

      if (
        !announcement ||
        !announcement.ID
      ) {
        throw new Error(
          "Backend ไม่ส่ง ID ของประกาศงานกลับมา",
        );
      }

      setUploadedAnnouncementID(
        announcement.ID,
      );

      message.success(
        "อัปโหลดรูปประกาศงานสำเร็จ",
      );

      await loadJobs();
    } catch (
      error
    ) {
      console.error(
        "Upload Error:",
        error,
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : "อัปโหลดประกาศงานไม่สำเร็จ";

      message.error(
        errorMessage,
      );

      setFileList(
        [],
      );
    } finally {
      setUploading(
        false,
      );
    }
  }

  // ===================================================
  // Upload Props
  // ===================================================

  const uploadProps:
    UploadProps = {

    fileList,

    maxCount: 1,

    accept:
      ".jpg,.jpeg,.png",

    beforeUpload:
      async (
        file,
      ) => {

        setFileList([
          {
            uid:
              file.uid,

            name:
              file.name,

            status:
              "uploading",

            originFileObj:
              file,
          },
        ]);

        await handleUpload(
          file,
        );

        return false;
      },

    onRemove: () => {
      setFileList(
        [],
      );

      setUploadedAnnouncementID(
        null,
      );

      return true;
    },
  };

  // ===================================================
  // Gemini Analyze
  // ===================================================

  async function handleAnalyze() {
    if (
      !uploadedAnnouncementID
    ) {
      message.warning(
        "กรุณาอัปโหลดรูปประกาศงานก่อน",
      );

      return;
    }

    try {
      setAnalyzing(
        true,
      );

      const response =
        await analyzeJobAnnouncement(
          uploadedAnnouncementID,
        );

      // ================================================
      // Backend Response:
      //
      // {
      //   data: {
      //     title: "...",
      //     description: [],
      //     requirements: [],
      //     suggested_criteria: []
      //   },
      //   message: "Gemini วิเคราะห์และบันทึกเกณฑ์สำเร็จ"
      // }
      // ================================================

      const result =
        response?.data?.data ??
        response?.data ??
        response;

      console.log(
        "Gemini Result:",
        result,
      );

      if (
        !result ||
        !result.title
      ) {
        throw new Error(
          "ไม่พบข้อมูลผลวิเคราะห์จาก Gemini",
        );
      }

      // -----------------------------------------------
      // เก็บข้อมูลไว้แสดง Preview
      // -----------------------------------------------

      setGeminiResult(
        result as GeminiResult,
      );

      // -----------------------------------------------
      // นำข้อมูล Gemini ใส่ Form
      // -----------------------------------------------

      form.setFieldsValue({
        title:
          result.title ??
          "",

        department:
          result.department ??
          "",

        location:
          result.location ??
          "",

        salary:
          result.salary ??
          "",

        type:
          result.employment_type ??
          "",

        description:
          convertToText(
            result.description,
          ),

        criteria:
          convertToText(
            result.requirements,
          ),
      });

      // -----------------------------------------------
      // เปิด Preview
      // -----------------------------------------------

      setPreviewOpen(
        true,
      );

      message.success(
        response?.data?.message ??
        "Gemini วิเคราะห์ประกาศงานสำเร็จ",
      );

    } catch (
      error: unknown
    ) {
      console.error(
        "Gemini Analyze Error:",
        error,
      );

      let errorMessage =
        "Gemini วิเคราะห์ประกาศงานไม่สำเร็จ";

      if (
        error &&
        typeof error ===
          "object" &&
        "response" in error
      ) {
        const axiosError =
          error as {
            response?: {
              data?: {
                error?: string;
                message?: string;
              };
            };
          };

        errorMessage =
          axiosError
            .response
            ?.data
            ?.error
          ??
          axiosError
            .response
            ?.data
            ?.message
          ??
          errorMessage;
      }

      if (
        error instanceof Error
      ) {
        errorMessage =
          error.message;
      }

      message.error(
        errorMessage,
      );
    } finally {
      setAnalyzing(
        false,
      );
    }
  }

  // ===================================================
  // Save Job
  // ===================================================

  async function handleSave() {
    try {
      const values =
        await form.validateFields();

      setSaving(
        true,
      );

      // -----------------------------------------------
      // ถ้าสร้าง Job ชั่วคราวแล้ว
      // ให้ Update Job เดิม
      // -----------------------------------------------

      if (
        editingJob?.ID
      ) {
        await updatejob(
          editingJob.ID,
          values.title,
          values.description ??
            "",
          values.criteria ??
            "",
          values.department ??
            "",
          values.location ??
            "",
          values.salary ??
            "",
          values.type ??
            "",
          values.benefits ??
            "",
          values.contact_info ??
            "",
          values.status ??
            "เปิดรับสมัคร",
        );

        message.success(
          "บันทึกตำแหน่งงานสำเร็จ",
        );

      } else {

        // ---------------------------------------------
        // กรณียังไม่ได้อัปโหลดรูป
        // ---------------------------------------------

        await createjob(
          values.title,
          values.description ??
            "",
          values.criteria ??
            "",
          values.department ??
            "",
          values.location ??
            "",
          values.salary ??
            "",
          values.type ??
            "",
          values.benefits ??
            "",
          values.contact_info ??
            "",
          values.status ??
            "เปิดรับสมัคร",
        );

        message.success(
          "สร้างตำแหน่งงานสำเร็จ",
        );
      }

      setModalOpen(
        false,
      );

      setPreviewOpen(
        false,
      );

      resetModal();

      await loadJobs();

    } catch (
      error
    ) {
      console.error(
        "Save Error:",
        error,
      );

      message.error(
        "ไม่สามารถบันทึกตำแหน่งงานได้",
      );
    } finally {
      setSaving(
        false,
      );
    }
  }

  // ===================================================
  // Delete Job
  // ===================================================

  async function handleDelete(
    id: number,
  ) {
    try {
      await deletejob(
        id,
      );

      message.success(
        "ลบตำแหน่งงานสำเร็จ",
      );

      await loadJobs();

    } catch (
      error
    ) {
      console.error(
        "Delete Error:",
        error,
      );

      message.error(
        "ไม่สามารถลบตำแหน่งงานได้",
      );
    }
  }

  // ===================================================
  // Table Columns
  // ===================================================

  const columns = [

    {
      title:
        "ตำแหน่งงาน",

      key:
        "title",

      render: (
        _: unknown,
        record: JobPosition,
      ) => (
        <Space
          direction="vertical"
          size={0}
        >
          <Text strong>
            {
              record.title
            }
          </Text>

          <Text
            type="secondary"
          >
            {
              record.department ||
              "-"
            }
          </Text>
        </Space>
      ),
    },

    {
      title:
        "สถานที่",

      dataIndex:
        "location",

      key:
        "location",

      render: (
        value:
          | string
          | undefined,
      ) =>
        value ||
        "-",
    },

    {
      title:
        "ประเภท",

      dataIndex:
        "type",

      key:
        "type",

      render: (
        value:
          | string
          | undefined,
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
        value:
          | string
          | undefined,
      ) => (
        <Tag
          color={
            value ===
            "เปิดรับสมัคร"
              ? "green"
              : "red"
          }
        >
          {
            value ||
            "-"
          }
        </Tag>
      ),
    },

    {
      title:
        "จัดการ",

      key:
        "action",

      render: (
        _: unknown,
        record: JobPosition,
      ) => (
        <Space
          wrap
        >

          <Button
            icon={
              <EyeOutlined />
            }
            onClick={() =>
              openEditModal(
                record,
              )
            }
          >
            ดู / แก้ไข
          </Button>

          <Button
            type="primary"
            icon={
              <SettingOutlined />
            }
            onClick={() => {

              if (
                !record.ID
              ) {
                message.error(
                  "ไม่พบ ID ของตำแหน่งงาน",
                );

                return;
              }

              setSelectedJobId(
                record.ID,
              );

              setCriteriaModalOpen(
                true,
              );
            }}
          >
            จัดการเกณฑ์
          </Button>

          <Popconfirm
            title="ยืนยันการลบตำแหน่งงาน"
            description="ข้อมูลตำแหน่งงานและข้อมูลที่เกี่ยวข้องอาจถูกลบ"
            okText="ลบ"
            cancelText="ยกเลิก"
            onConfirm={() =>
              handleDelete(
                record.ID,
              )
            }
          >
            <Button
              danger
              icon={
                <DeleteOutlined />
              }
            >
              ลบ
            </Button>
          </Popconfirm>

        </Space>
      ),
    },
  ];

  // ===================================================
  // Render
  // ===================================================

  return (
    <div
      style={{
        padding:
          24,
      }}
    >

      {/* Header */}

      <Row
        justify="space-between"
        align="middle"
        gutter={[
          16,
          16,
        ]}
      >

        <Col>

          <Title
            level={2}
            style={{
              marginBottom:
                4,
            }}
          >
            จัดการตำแหน่งงาน
          </Title>

          <Text
            type="secondary"
          >
            อัปโหลดประกาศงาน
            {" → "}
            Gemini วิเคราะห์
            {" → "}
            HR ตรวจสอบ
            {" → "}
            กำหนดเกณฑ์คะแนน
          </Text>

        </Col>

        <Col>

          <Button
            type="primary"
            size="large"
            icon={
              <PlusOutlined />
            }
            onClick={
              openCreateModal
            }
          >
            สร้างตำแหน่งงาน
          </Button>

        </Col>

      </Row>

      <Divider />

      {/* Statistics */}

      <Row
        gutter={16}
      >

        <Col
          xs={24}
          md={8}
        >
          <Card>

            <Statistic
              title="ตำแหน่งงานทั้งหมด"
              value={
                statistics.total
              }
            />

          </Card>
        </Col>

        <Col
          xs={24}
          md={8}
        >
          <Card>

            <Statistic
              title="กำลังเปิดรับ"
              value={
                statistics.opened
              }
            />

          </Card>
        </Col>

        <Col
          xs={24}
          md={8}
        >
          <Card>

            <Statistic
              title="ปิดรับสมัคร"
              value={
                statistics.closed
              }
            />

          </Card>
        </Col>

      </Row>

      <Divider />

      {/* Job Table */}

      <Card>

        <Table
          rowKey="ID"
          loading={
            loading
          }
          columns={
            columns
          }
          dataSource={
            jobs
          }
          scroll={{
            x:
              1000,
          }}
          locale={{
            emptyText: (
              <Empty
                description="ยังไม่มีตำแหน่งงาน"
              />
            ),
          }}
        />

      </Card>

      {/* ================================================= */}
      {/* Create / Edit Modal */}
      {/* ================================================= */}

      <Modal
        title={
          editingJob
            ? "แก้ไขตำแหน่งงาน"
            : "สร้างตำแหน่งงานใหม่"
        }
        open={
          modalOpen
        }
        width={
          1100
        }
        destroyOnClose
        onCancel={() => {
          setModalOpen(
            false,
          );

          resetModal();
        }}
        footer={[

          <Button
            key="cancel"
            onClick={() => {
              setModalOpen(
                false,
              );

              resetModal();
            }}
          >
            ยกเลิก
          </Button>,

          <Button
            key="save"
            type="primary"
            loading={
              saving
            }
            icon={
              <SaveOutlined />
            }
            onClick={
              handleSave
            }
          >
            บันทึกตำแหน่งงาน
          </Button>,

        ]}
      >

        <Form
          form={
            form
          }
          layout="vertical"
        >

          {/* Step 1 */}

          <Card
            size="small"
            title="ขั้นที่ 1: ข้อมูลเบื้องต้น"
          >

            <Row
              gutter={16}
            >

              <Col
                xs={24}
                md={12}
              >

                <Form.Item
                  label="ชื่อตำแหน่งงาน"
                  name="title"
                  rules={[
                    {
                      required:
                        true,

                      message:
                        "กรุณาระบุชื่อตำแหน่งงาน",
                    },
                  ]}
                >

                  <Input
                    placeholder="เช่น Software Test Engineer"
                  />

                </Form.Item>

              </Col>

              <Col
                xs={24}
                md={12}
              >

                <Form.Item
                  label="แผนก"
                  name="department"
                >

                  <Input />

                </Form.Item>

              </Col>

              <Col
                xs={24}
                md={12}
              >

                <Form.Item
                  label="สถานที่ทำงาน"
                  name="location"
                >

                  <Input />

                </Form.Item>

              </Col>

              <Col
                xs={24}
                md={12}
              >

                <Form.Item
                  label="เงินเดือน"
                  name="salary"
                >

                  <Input />

                </Form.Item>

              </Col>

              <Col
                xs={24}
                md={12}
              >

                <Form.Item
                  label="ประเภทการจ้าง"
                  name="type"
                >

                  <Select
                    placeholder="เลือกประเภท"
                    options={[
                      {
                        label:
                          "งานประจำ",

                        value:
                          "งานประจำ",
                      },

                      {
                        label:
                          "สัญญาจ้าง",

                        value:
                          "สัญญาจ้าง",
                      },

                      {
                        label:
                          "ฝึกงาน",

                        value:
                          "ฝึกงาน",
                      },
                    ]}
                  />

                </Form.Item>

              </Col>

              <Col
                xs={24}
                md={12}
              >

                <Form.Item
                  label="สถานะ"
                  name="status"
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
                          "ปิดรับสมัครแล้ว",

                        value:
                          "ปิดรับสมัครแล้ว",
                      },
                    ]}
                  />

                </Form.Item>

              </Col>

            </Row>

          </Card>

          <Divider />

          {/* Step 2 */}

          <Card
            size="small"
            title="ขั้นที่ 2: อัปโหลดรูปประกาศงาน"
          >

            <Paragraph
              type="secondary"
            >
              รองรับไฟล์ JPG, JPEG และ PNG
              กรุณาระบุชื่อตำแหน่งงานก่อนอัปโหลด
            </Paragraph>

            <Upload
              {...uploadProps}
            >

              <Button
                loading={
                  uploading
                }
                icon={
                  <UploadOutlined />
                }
              >
                เลือกรูปประกาศงาน
              </Button>
                 {
                uploadedAnnouncementID && (
                  <Tag
                    color="green"
                  >
                    อัปโหลดสำเร็จ
                  </Tag>
                )
              }

            </Upload>
            

            <Space
              style={{
                marginTop:
                  16,
              }}
              wrap
            >

              <Button
                type="primary"
                icon={
                  <RobotOutlined />
                }
                loading={
                  analyzing
                }
                disabled={
                  !uploadedAnnouncementID
                }
                onClick={
                  handleAnalyze
                }
              >
                Gemini วิเคราะห์ประกาศงาน
              </Button>

            </Space>

          </Card>

          <Divider />

          {/* Step 3 */}

          <Card
            size="small"
            title="ขั้นที่ 3: ตรวจสอบและแก้ไขข้อมูล"
          >

            <Form.Item
              label="รายละเอียดงาน"
              name="description"
            >

              <TextArea
                rows={7}
                placeholder="Gemini จะนำรายละเอียดงานมาใส่ให้อัตโนมัติ"
              />

            </Form.Item>

            <Form.Item
              label="คุณสมบัติที่ต้องการ"
              name="criteria"
            >

              <TextArea
                rows={7}
                placeholder="Gemini จะนำคุณสมบัติผู้สมัครมาใส่ให้อัตโนมัติ"
              />

            </Form.Item>

            <Form.Item
              label="สวัสดิการ"
              name="benefits"
            >

              <TextArea
                rows={3}
              />

            </Form.Item>

            <Form.Item
              label="ข้อมูลติดต่อ"
              name="contact_info"
            >

              <TextArea
                rows={3}
              />

            </Form.Item>

          </Card>

          {/* Gemini Suggested Criteria */}

          {
            geminiResult && (
              <>
                <Divider />

                <Card
                  title={
                    <Space>

                      <RobotOutlined />

                      <span>
                        เกณฑ์ที่ Gemini วิเคราะห์
                      </span>

                    </Space>
                  }
                >

                  <Paragraph
                    type="secondary"
                  >
                    Gemini ได้บันทึกเกณฑ์หลักลงฐานข้อมูลแล้ว
                    หลังบันทึกตำแหน่งงาน
                    ให้กดปุ่ม “จัดการเกณฑ์”
                    เพื่อเพิ่มตัวเลือกและกำหนดคะแนน
                  </Paragraph>

                  <List
                    bordered
                    dataSource={
                      geminiResult
                        .suggested_criteria ??
                      []
                    }
                    renderItem={(
                      item,
                      index,
                    ) => (

                      <List.Item>

                        <List.Item.Meta
                          title={
                            <Space>

                              <Text strong>

                                {
                                  index + 1
                                }
                                .{" "}
                                {
                                  item.name
                                }

                              </Text>

                              <Tag
                                color="blue"
                              >

                                น้ำหนัก{" "}
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
            )
          }

        </Form>

      </Modal>

      {/* ================================================= */}
      {/* Gemini Preview */}
      {/* ================================================= */}

      <Modal
        title={
          <Space>

            <RobotOutlined />

            Gemini Analysis Preview

          </Space>
        }
        open={
          previewOpen
        }
        width={
          1000
        }
        onCancel={() =>
          setPreviewOpen(
            false,
          )
        }
        footer={[

          <Button
            key="back"
            onClick={() =>
              setPreviewOpen(
                false,
              )
            }
          >
            กลับไปแก้ไข
          </Button>,

          <Button
            key="confirm"
            type="primary"
            icon={
              <SaveOutlined />
            }
            onClick={() => {

              setPreviewOpen(
                false,
              );

              message.info(
                "ตรวจสอบข้อมูลในฟอร์ม แล้วกดบันทึกตำแหน่งงาน",
              );
            }}
          >
            ยืนยันข้อมูล
          </Button>,

        ]}
      >

        {
          geminiResult
            ? (
              <>

                <Descriptions
                  bordered
                  column={2}
                >

                  <Descriptions.Item
                    label="ตำแหน่งงาน"
                  >

                    {
                      geminiResult.title ||
                      "-"
                    }

                  </Descriptions.Item>

                  <Descriptions.Item
                    label="สถานที่"
                  >

                    {
                      geminiResult.location ||
                      "-"
                    }

                  </Descriptions.Item>

                  <Descriptions.Item
                    label="แผนก"
                  >

                    {
                      geminiResult.department ||
                      "-"
                    }

                  </Descriptions.Item>

                  <Descriptions.Item
                    label="ประเภทงาน"
                  >

                    {
                      geminiResult
                        .employment_type ||
                      "-"
                    }

                  </Descriptions.Item>

                </Descriptions>

                <Divider />

                <Title
                  level={5}
                >
                  Technical Skills
                </Title>

                <Space
                  wrap
                >

                  {
                    convertToArray(
                      geminiResult
                        .technical_skills,
                    ).map(
                      (
                        skill,
                      ) => (

                        <Tag
                          color="blue"
                          key={
                            skill
                          }
                        >

                          {
                            skill
                          }

                        </Tag>

                      ),
                    )
                  }

                </Space>

                <Divider />

                <Title
                  level={5}
                >
                  Soft Skills
                </Title>

                <Space
                  wrap
                >

                  {
                    convertToArray(
                      geminiResult
                        .soft_skills,
                    ).map(
                      (
                        skill,
                      ) => (

                        <Tag
                          color="purple"
                          key={
                            skill
                          }
                        >

                          {
                            skill
                          }

                        </Tag>

                      ),
                    )
                  }

                </Space>

                <Divider />

                <Title
                  level={5}
                >
                  คุณสมบัติที่ต้องการ
                </Title>

                <List
                  bordered
                  dataSource={
                    convertToArray(
                      geminiResult
                        .requirements,
                    )
                  }
                  renderItem={(
                    item,
                    index,
                  ) => (

                    <List.Item>

                      {
                        index + 1
                      }
                      .{" "}
                      {
                        item
                      }

                    </List.Item>

                  )}
                />

                <Divider />

                <Title
                  level={5}
                >
                  เกณฑ์ที่ Gemini แนะนำ
                </Title>

                <List
                  bordered
                  dataSource={
                    geminiResult
                      .suggested_criteria ??
                    []
                  }
                  renderItem={(
                    item,
                    index,
                  ) => (

                    <List.Item>

                      <List.Item.Meta
                        title={
                          <Space>

                            <Text strong>

                              {
                                index + 1
                              }
                              .{" "}
                              {
                                item.name
                              }

                            </Text>

                            <Tag
                              color="green"
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

              </>
            )
            : (
              <Spin />
            )
        }

      </Modal>

      {/* ================================================= */}
      {/* Job Criteria Modal */}
      {/* ================================================= */}

      <Modal
        title="จัดการเกณฑ์ประเมินผู้สมัคร"
        open={
          criteriaModalOpen
        }
        width={
          1200
        }
        footer={
          null
        }
        destroyOnClose
        onCancel={() => {

          setCriteriaModalOpen(
            false,
          );

          setSelectedJobId(
            null,
          );
        }}
      >

        {
          selectedJobId !== null
            ? (
              <JobCriteriaPage
                jobPositionId={
                  selectedJobId
                }
              />
            )
            : null
        }

      </Modal>

    </div>
  );
}