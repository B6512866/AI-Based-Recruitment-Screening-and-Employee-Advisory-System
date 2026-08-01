import {
  useEffect,
  useState,
} from "react";

import {
  Button,
  Card,
  Collapse,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from "antd";

import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";

import {
  createCriteriaOption,
  createJobCriteria,
  deleteCriteriaOption,
  deleteJobCriteria,
  getCriteriaOptions,
  getJobCriteria,
  type JobCriteria,
  type JobCriteriaOption,
} from "../../services/jobCriteriaService";

const { Title, Text, Paragraph } = Typography;

interface Props {
  jobPositionId: number;
}

export default function JobCriteriaPage({
  jobPositionId,
}: Props) {
  const [criteria, setCriteria] =
    useState<JobCriteria[]>([]);

  const [options, setOptions] =
    useState<
      Record<number, JobCriteriaOption[]>
    >({});

  const [loading, setLoading] =
    useState(false);

  const [criteriaModal, setCriteriaModal] =
    useState(false);

  const [optionModal, setOptionModal] =
    useState(false);

  const [selectedCriteriaId, setSelectedCriteriaId] =
    useState<number | null>(null);

  const [criteriaForm] = Form.useForm();

  const [optionForm] = Form.useForm();

  // ==========================================
  // โหลดเกณฑ์
  // ==========================================

  async function loadCriteria() {
    try {
      setLoading(true);

      const result =
        await getJobCriteria(
          jobPositionId
        );

      const criteriaData =
        result.data || [];

      setCriteria(
        criteriaData
      );

      // โหลดตัวเลือกของทุกเกณฑ์
      const optionMap:
        Record<
          number,
          JobCriteriaOption[]
        > = {};

      await Promise.all(
        criteriaData.map(
          async (
            item: JobCriteria
          ) => {
            const response =
              await getCriteriaOptions(
                item.ID
              );

            optionMap[item.ID] =
              response.data || [];
          }
        )
      );

      setOptions(
        optionMap
      );
    } catch (error) {
      console.error(error);

      message.error(
        "ไม่สามารถโหลดเกณฑ์การประเมินได้"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (
      jobPositionId > 0
    ) {
      loadCriteria();
    }
  }, [
    jobPositionId,
  ]);

  // ==========================================
  // เพิ่มเกณฑ์หลัก
  // ==========================================

  async function handleCreateCriteria(
    values: {
      name: string;
      description: string;
      weight: number;
      is_required: boolean;
    }
  ) {
    try {
      await createJobCriteria(
        jobPositionId,
        {
          name:
            values.name,
          description:
            values.description || "",
          weight:
            Number(
              values.weight
            ),
          is_required:
            values.is_required ||
            false,
        }
      );

      message.success(
        "เพิ่มเกณฑ์สำเร็จ"
      );

      setCriteriaModal(
        false
      );

      criteriaForm.resetFields();

      loadCriteria();
    } catch (error: any) {
      message.error(
        error?.response
          ?.data?.error ||
          "ไม่สามารถเพิ่มเกณฑ์ได้"
      );
    }
  }

  // ==========================================
  // ลบเกณฑ์
  // ==========================================

  async function handleDeleteCriteria(
    criteriaId: number
  ) {
    try {
      await deleteJobCriteria(
        criteriaId
      );

      message.success(
        "ลบเกณฑ์สำเร็จ"
      );

      loadCriteria();
    } catch (error: any) {
      message.error(
        error?.response
          ?.data?.error ||
          "ไม่สามารถลบเกณฑ์ได้"
      );
    }
  }

  // ==========================================
  // เพิ่มตัวเลือก
  // ==========================================

  async function handleCreateOption(
    values: {
      name: string;
      description: string;
      score: number;
      is_active: boolean;
    }
  ) {
    if (
      selectedCriteriaId ===
      null
    ) {
      return;
    }

    try {
      await createCriteriaOption(
        selectedCriteriaId,
        {
          name:
            values.name,
          description:
            values.description || "",
          score:
            Number(
              values.score
            ),
          is_active:
            values.is_active ??
            true,
        }
      );

      message.success(
        "เพิ่มตัวเลือกคะแนนสำเร็จ"
      );

      setOptionModal(
        false
      );

      optionForm.resetFields();

      setSelectedCriteriaId(
        null
      );

      loadCriteria();
    } catch (error: any) {
      message.error(
        error?.response
          ?.data?.error ||
          "ไม่สามารถเพิ่มตัวเลือกได้"
      );
    }
  }

  // ==========================================
  // ลบตัวเลือก
  // ==========================================

  async function handleDeleteOption(
    optionId: number
  ) {
    try {
      await deleteCriteriaOption(
        optionId
      );

      message.success(
        "ลบตัวเลือกสำเร็จ"
      );

      loadCriteria();
    } catch (error: any) {
      message.error(
        error?.response
          ?.data?.error ||
          "ไม่สามารถลบตัวเลือกได้"
      );
    }
  }

  // ==========================================
  // ตารางตัวเลือก
  // ==========================================

  function renderOptionTable(
    criteriaId: number
  ) {
    const data =
      options[
        criteriaId
      ] || [];

    return (
      <Table
        size="small"
        rowKey="ID"
        dataSource={
          data
        }
        pagination={
          false
        }
        columns={[
          {
            title:
              "ตัวเลือก",
            dataIndex:
              "name",
          },
          {
            title:
              "รายละเอียด",
            dataIndex:
              "description",
          },
          {
            title:
              "คะแนน",
            dataIndex:
              "score",
            width:
              100,
            render:
              (
                score
              ) => (
                <Tag color="blue">
                  {
                    score
                  } คะแนน
                </Tag>
              ),
          },
          {
            title:
              "สถานะ",
            dataIndex:
              "is_active",
            width:
              100,
            render:
              (
                active
              ) =>
                active ? (
                  <Tag color="green">
                    ใช้งาน
                  </Tag>
                ) : (
                  <Tag>
                    ปิดใช้งาน
                  </Tag>
                ),
          },
          {
            title:
              "จัดการ",
            width:
              100,
            render:
              (
                _,
                record
              ) => (
                <Popconfirm
                  title="ลบตัวเลือกนี้?"
                  onConfirm={() =>
                    handleDeleteOption(
                      record.ID
                    )
                  }
                >
                  <Button
                    danger
                    type="text"
                    icon={
                      <DeleteOutlined />
                    }
                  />
                </Popconfirm>
              ),
          },
        ]}
      />
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      style={{
        padding: 24,
      }}
    >
      <Space
        direction="vertical"
        size={4}
        style={{
          width:
            "100%",
        }}
      >
        <Title level={2}>
          เกณฑ์ประเมินผู้สมัคร
        </Title>

        <Paragraph
          type="secondary"
        >
          กำหนดเกณฑ์หลัก
          และเพิ่มตัวเลือกพร้อมคะแนน
          เพื่อใช้เป็นข้อมูลสำหรับ
          AI วิเคราะห์ Resume
        </Paragraph>

        <Button
          type="primary"
          icon={
            <PlusOutlined />
          }
          onClick={() =>
            setCriteriaModal(
              true
            )
          }
        >
          เพิ่มเกณฑ์หลัก
        </Button>
      </Space>

      <Divider />

      {loading ? (
        <div
          style={{
            textAlign:
              "center",
            padding:
              50,
          }}
        >
          <Spin
            size="large"
          />
        </div>
      ) : (
        <Collapse
          items={
            criteria.map(
              (
                item,
                index
              ) => ({
                key:
                  item.ID,

                label: (
                  <Space>
                    <Text strong>
                      {
                        index +
                        1
                      }
                      . {
                        item.name
                      }
                    </Text>

                    {item.is_required && (
                      <Tag color="red">
                        จำเป็น
                      </Tag>
                    )}

                    <Tag color="blue">
                      น้ำหนัก{" "}
                      {
                        item.weight ||
                        0
                      }
                    </Tag>
                  </Space>
                ),

                children: (
                  <Space
                    direction="vertical"
                    style={{
                      width:
                        "100%",
                    }}
                  >
                    <Paragraph>
                      {
                        item.description
                      }
                    </Paragraph>

                    <Space>
                      <Button
                        type="primary"
                        icon={
                          <PlusOutlined />
                        }
                        onClick={() => {
                          setSelectedCriteriaId(
                            item.ID
                          );

                          optionForm.setFieldsValue(
                            {
                              is_active:
                                true,
                              score:
                                0,
                            }
                          );

                          setOptionModal(
                            true
                          );
                        }}
                      >
                        เพิ่มตัวเลือกคะแนน
                      </Button>

                      <Popconfirm
                        title="ต้องการลบเกณฑ์นี้หรือไม่?"
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
                        >
                          ลบเกณฑ์
                        </Button>
                      </Popconfirm>
                    </Space>

                    <Divider />

                    {
                      renderOptionTable(
                        item.ID
                      )
                    }
                  </Space>
                ),
              })
            )
          }
        />
      )}

      {/* ================================= */}
      {/* Modal เพิ่มเกณฑ์ */}
      {/* ================================= */}

      <Modal
        title="เพิ่มเกณฑ์หลัก"
        open={
          criteriaModal
        }
        onCancel={() => {
          setCriteriaModal(
            false
          );

          criteriaForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={
            criteriaForm
          }
          layout="vertical"
          initialValues={{
            weight:
              0,
            is_required:
              false,
          }}
          onFinish={
            handleCreateCriteria
          }
        >
          <Form.Item
            label="ชื่อเกณฑ์"
            name="name"
            rules={[
              {
                required:
                  true,
                message:
                  "กรุณาระบุชื่อเกณฑ์",
              },
            ]}
          >
            <Input
              placeholder="เช่น วุฒิการศึกษา"
            />
          </Form.Item>

          <Form.Item
            label="รายละเอียด"
            name="description"
          >
            <Input.TextArea
              rows={3}
              placeholder="อธิบายสิ่งที่ AI ต้องตรวจสอบ"
            />
          </Form.Item>

          <Form.Item
            label="น้ำหนัก"
            name="weight"
          >
            <InputNumber
              min={0}
              max={100}
              style={{
                width:
                  "100%",
              }}
            />
          </Form.Item>

          <Form.Item
            label="เป็นเกณฑ์บังคับ"
            name="is_required"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Button
            htmlType="submit"
            type="primary"
            icon={
              <SaveOutlined />
            }
            block
          >
            บันทึกเกณฑ์
          </Button>
        </Form>
      </Modal>

      {/* ================================= */}
      {/* Modal เพิ่มตัวเลือก */}
      {/* ================================= */}

      <Modal
        title="เพิ่มตัวเลือกและคะแนน"
        open={
          optionModal
        }
        onCancel={() => {
          setOptionModal(
            false
          );

          setSelectedCriteriaId(
            null
          );

          optionForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={
            optionForm
          }
          layout="vertical"
          initialValues={{
            score:
              0,
            is_active:
              true,
          }}
          onFinish={
            handleCreateOption
          }
        >
          <Form.Item
            label="ชื่อตัวเลือก"
            name="name"
            rules={[
              {
                required:
                  true,
                message:
                  "กรุณาระบุชื่อตัวเลือก",
              },
            ]}
          >
            <Input
              placeholder="เช่น จบวิศวกรรมคอมพิวเตอร์"
            />
          </Form.Item>

          <Form.Item
            label="รายละเอียด"
            name="description"
          >
            <Input.TextArea
              rows={3}
              placeholder="รายละเอียดเพิ่มเติม"
            />
          </Form.Item>

          <Form.Item
            label="คะแนน"
            name="score"
            rules={[
              {
                required:
                  true,
                message:
                  "กรุณาระบุคะแนน",
              },
            ]}
          >
            <InputNumber
              min={0}
              style={{
                width:
                  "100%",
              }}
            />
          </Form.Item>

          <Form.Item
            label="เปิดใช้งาน"
            name="is_active"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            icon={
              <PlusOutlined />
            }
            block
          >
            เพิ่มตัวเลือก
          </Button>
        </Form>
      </Modal>
    </div>
  );
}