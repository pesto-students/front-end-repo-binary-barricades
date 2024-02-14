"use client";
import { CTX } from "@/context/context";
import {
  Avatar,
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
  SimpleGrid,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { COLORS } from "../colors";
import Image from "next/image";
import dayjs from "dayjs";

import doctorDashboard from "../../../public/images/doctorDashboard.svg";
import { useDispatch, useSelector } from "react-redux";
import { getMyUpcommingAppointments } from "@/store/slices/healthcare/appointmentSlice";
import DoctorTimeSlots from "@/components/DoctorTimeSlots";
import AppointmentDetails from "@/components/AppointmentDetails";
import { useRouter } from "next/navigation";
import { createAvailability } from "@/store/slices/healthcare/profileSlice";
import moment from "moment";
import LoadingBackdrop from "@/components/Loader";
import {
  getDoctorsAvailabilityAction,
  getVideoConferenceDetailsAction,
} from "@/store/actions/patient/appointmentActions";
function Page() {
  const router = useRouter();
  const dispatch: any = useDispatch();
  const authContext: any = useContext(CTX);
  const currentDate = dayjs();
  const { isOpen, onOpen, onClose }: any = useDisclosure();
  const { userDetails, _meetingDetails }: any = authContext;
  const [upcommingAppointments, setUpcommingAppointments] = useState([]);
  const [date, setDate]: any = useState();
  const [startTime, onChangeStartTime]: any = useState("09:00");
  const [endTime, onChangeEndTime]: any = useState("12:00");
  const [selectedDate, setSelctedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [appointmentDate, setAppointmentDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [selectedAppointment, setSelectedAppointment] = useState({});
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const videoConferenceDetails = useSelector(
    (state: any) => state?.appointmentData?.videoConferenceDetails?.data
  );
  const doctorsAvailability = useSelector(
    (state: any) => state?.appointmentData?.doctorsAvailability?.data
  );
  const handleGetUpcommingAppointment = async () => {
    const res = await dispatch(
      getMyUpcommingAppointments({
        doctorId: userDetails?._id,
        date: appointmentDate,
      })
    );
    setUpcommingAppointments(res?.payload?.data);
    fetchTimeSlots();
  };
  useEffect(() => {
    handleGetUpcommingAppointment();
  }, [userDetails, appointmentDate]);
  const fetchTimeSlots = async () => {
    await dispatch(
      getDoctorsAvailabilityAction({ doctorId: userDetails?._id })
    );
  };

  const getFormattedDate = (date: any) => {
    const options: any = { weekday: "short", month: "short", day: "numeric" };
    return new Date(date).toLocaleDateString("en-US", options);
  };
  const handleSelectedAppointment = (data: any) => {
    setSelectedAppointment(data);
    onOpen();
  };
  const handleJoin = async (appointmentId: any) => {
    await dispatch(
      getVideoConferenceDetailsAction({ appointmentId: appointmentId })
    );
    _meetingDetails({
      appointmentId: appointmentId,
      patientId: videoConferenceDetails?.payload?.data?.patientId,
    });
  };
  useEffect(() => {
    if (videoConferenceDetails?.status === 200) {
      setLoading(false);
      router.push(
        `/meeting?${videoConferenceDetails?.payload?.data?.meetingInfo?.id}`
      );
    } else {
      setLoading(false);
    }
  }, [videoConferenceDetails]);
  const formatTimeRange = (startTime: string, endTime: string) => {
    const startHour = parseInt(startTime.split(":")[0]);
    const startMinute = parseInt(startTime.split(":")[1]);

    const endHour = parseInt(endTime.split(":")[0]);
    const endMinute = parseInt(endTime.split(":")[1]);

    const formattedStartHour = startHour % 12 === 0 ? 12 : startHour % 12;
    const formattedStartTime = `${formattedStartHour}:${startMinute
      .toString()
      .padStart(2, "0")} ${startHour >= 12 ? "PM" : "AM"}`;

    const formattedEndHour = endHour % 12 === 0 ? 12 : endHour % 12;
    const formattedEndTime = `${formattedEndHour}:${endMinute
      .toString()
      .padStart(2, "0")} ${endHour >= 12 ? "PM" : "AM"}`;

    return `${formattedStartTime} - ${formattedEndTime}`;
  };

  const updateAvailability = async () => {
    setLoading(true);
    const payload = {
      doctorId: userDetails?._id,
      availability: [
        {
          date: dayjs(date).format("YYYY-MM-DD"),
          availableTimeSlots: [formatTimeRange(startTime, endTime)],
          duration: duration,
          unavailableTimeSlots: [],
        },
      ],
    };

    if (duration < 0) {
      alert("Duration can not be less or equal to zero");
      return;
    }
    const res = await dispatch(createAvailability(payload));

    if (res?.payload?.status === 200) {
      setLoading(false);
      fetchTimeSlots();
    } else {
      setLoading(false);
      alert("Something went wrong");
    }
  };
  console.log("doctorsAvailability", doctorsAvailability);

  return (
    <>
      {loading && <LoadingBackdrop />}
      <Box p={8} px={12} w={"100%"} mt={4}>
        {doctorsAvailability?.length === 0 && (
          <Box
            bg={"#ff000050"}
            borderRadius={10}
            p={4}
            display={"inline-block"}
            mb={4}
          >
            <Text color={COLORS.error}>
              Please update your availability for start getting appointments.
            </Text>
          </Box>
        )}
        <Stack direction={"row"} alignItems={"center"}>
          <Text fontWeight={"700"} fontSize={"2xl"}>
            Hello Dr.
          </Text>
          <Text color={COLORS.primary} fontWeight={"700"} fontSize={"2xl"}>
            {userDetails?.first_name} {userDetails?.last_name}
          </Text>
        </Stack>
        <Box
          p={4}
          px={8}
          mt={8}
          borderRadius={20}
          display={"flex"}
          flexDirection={"row"}
          alignItems={"start"}
          position={"relative"}
          bgGradient="linear-gradient(66deg, #B2E6FD -5.25%, #9BD8F1 -5.24%, #6C63FF 98.77%)"
        >
          <Stack>
            <Text fontSize={"lg"} fontWeight={"700"}>
              Visit for today
            </Text>
            <Text fontSize={"42px"} fontWeight={"700"}>
              15
            </Text>
            <Stack direction={"row"} gap={4} mt={8}>
              <Box
                backgroundColor={"rgba(255, 255, 255, 0.55)"}
                borderRadius={10}
                p={2}
                px={4}
              >
                <Stack>
                  <Text fontSize={"sm"} color={COLORS.secondary}>
                    Clinic Visit
                  </Text>
                  <Text fontSize={"xl"} fontWeight={"700"}>
                    3
                  </Text>
                </Stack>
              </Box>
              <Box
                backgroundColor={"rgba(255, 255, 255, 0.55)"}
                borderRadius={10}
                p={2}
                px={4}
              >
                <Stack>
                  <Text fontSize={"sm"} color={COLORS.secondary}>
                    Online Consultation
                  </Text>
                  <Text fontSize={"xl"} fontWeight={"700"}>
                    3
                  </Text>
                </Stack>
              </Box>
            </Stack>
          </Stack>
          <Box position={"absolute"} top={-118} right={0}>
            <Image src={doctorDashboard} alt="login-svg" />
          </Box>
        </Box>
        <SimpleGrid gap={8} dir="row" columns={{ sm: 1, md: 2 }} mt={4}>
          <Box w={"100%"} pr={24}>
            <Stack>
              <Text fontSize={"lg"} fontWeight={"700"} mb={4}>
                Upcomming Appointments
              </Text>
              <Select
                variant="filled"
                value={appointmentDate}
                width={"50%"}
                mb={4}
                onChange={(e) => setAppointmentDate(e.target.value)}
              >
                <option value={currentDate.format("YYYY-MM-DD").toString()}>
                  Today
                </option>
                <option
                  value={currentDate
                    .add(1, "day")
                    .format("YYYY-MM-DD")
                    .toString()}
                >
                  Tomorrow
                </option>
                <option
                  value={currentDate
                    .add(2, "day")
                    .format("YYYY-MM-DD")
                    .toString()}
                >
                  {currentDate.add(2, "day").format("YYYY-MM-DD").toString()}
                </option>
              </Select>
            </Stack>
            {upcommingAppointments?.length > 0 ? (
              upcommingAppointments?.map((items: any, index: any) => {
                return (
                  <Stack
                    direction={"row"}
                    alignItems={"center"}
                    p={4}
                    backgroundColor={
                      index === 0 ? "rgba(108, 99, 255, 0.5)" : "white"
                    }
                    borderRadius={20}
                    boxShadow={" 0px 4px 32px 0px rgba(0, 0, 0, 0.10)"}
                    mb={4}
                    cursor={"pointer"}
                    justifyContent={"space-evenly"}
                    onClick={() => handleSelectedAppointment(items)}
                  >
                    <Avatar name={items?.patientInfo?.full_name} size={"sm"} />
                    <Text fontWeight={index === 0 ? "700" : "500"}>
                      {items?.patientInfo?.full_name}
                    </Text>
                    <Text fontWeight={index === 0 ? "700" : "500"}>
                      {items?.time}
                    </Text>
                    <Text fontWeight={index === 0 ? "700" : "500"}>
                      {items?.onlineConsultation ? "Online" : "In Clinic"}
                    </Text>
                  </Stack>
                );
              })
            ) : (
              <Box bg={"rgba(108, 99, 255, 0.2)"} borderRadius={10} p={2}>
                <Text
                  color={COLORS.secondary}
                  fontSize={"md"}
                  fontWeight={"600"}
                >
                  Currently You don't have any appointment for {appointmentDate}
                </Text>
              </Box>
            )}
          </Box>
          <Box>
            <Text fontSize={"lg"} fontWeight={"700"} mb={4}>
              Avaialability
            </Text>
            <Stack
              direction={"row"}
              alignItems={"center"}
              justifyContent={"space-between"}
              mb={4}
            >
              <Select
                variant="filled"
                value={selectedDate}
                width={"50%"}
                onChange={(e) => setSelctedDate(e.target.value)}
              >
                {doctorsAvailability?.length > 0 &&
                  doctorsAvailability?.map((date: any) => (
                    <option value={date.date}>
                      {getFormattedDate(date.date)}
                    </option>
                  ))}
              </Select>
              <Button onClick={() => updateAvailability()}>Update</Button>
            </Stack>
            <Tabs>
              <TabList>
                <Tab w={"100%"}>Available</Tab>
                <Tab w={"100%"}>Booked</Tab>
              </TabList>

              <TabPanels>
                <TabPanel maxHeight={"20vh"} overflowY={"scroll"}>
                  <DoctorTimeSlots
                    selectedDate={selectedDate}
                    doctorsAvailability={doctorsAvailability}
                  />
                </TabPanel>
                <TabPanel>
                  <Box>
                    <HStack>
                      <FormControl>
                        {/* <FormLabel>Select date</FormLabel> */}
                        {/* <SingleDatepicker
                          date={date}
                          onDateChange={(date) => {
                            setDate(date as Date);
                          }}
                        /> */}
                        <FormLabel>Select date</FormLabel>
                        <Input
                          type="date"
                          placeholder="DOB"
                          value={date}
                          onChange={(e: any) =>
                            setDate(moment(e.target.value).format("YYYY-MM-DD"))
                          }
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Time Slot duration (min)</FormLabel>
                        <Input
                          type="number"
                          placeholder="10 min"
                          value={duration}
                          onChange={(e: any) => setDuration(e.target.value)}
                        />
                      </FormControl>
                    </HStack>
                    {/* <Box position="relative" padding="10">
                      <Divider />
                      <AbsoluteCenter bg="white" px="4">
                        Select Available time
                      </AbsoluteCenter>
                    </Box> */}
                    <HStack>
                      <FormControl>
                        <FormLabel>Select Start Time</FormLabel>
                        <Input
                          type="time"
                          placeholder="Select Start Time"
                          value={startTime}
                          onChange={(e: any) =>
                            onChangeStartTime(e.target.value)
                          }
                        />
                        {/* <TimePicker
                          onChange={onChangeStartTime}
                          value={startTime}
                        /> */}
                      </FormControl>
                      <FormControl>
                        <FormLabel>Select End Time</FormLabel>
                        <Input
                          type="time"
                          placeholder="Select End Time"
                          value={endTime}
                          onChange={(e: any) => onChangeEndTime(e.target.value)}
                        />
                        {/* <TimePicker
                          onChange={onChangeEndTime}
                          value={endTime}
                        /> */}
                      </FormControl>
                    </HStack>
                    {/* <Box position="relative" padding="10">
                      <Divider />
                      <AbsoluteCenter bg="white" px="4">
                        Select Unavailable time
                      </AbsoluteCenter>
                    </Box>

                    <HStack>
                      <FormControl>
                        <FormLabel>Select Start Time</FormLabel>
                        <TimePicker
                          onChange={onChangeUnavailbleStartTime}
                          value={unavailbleStartTime}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Select End Time</FormLabel>
                        <TimePicker
                          onChange={onChangeUnavailbleEndTime}
                          value={unavailbleEndTime}
                        />
                      </FormControl>
                    </HStack> */}
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </SimpleGrid>
      </Box>
      <AppointmentDetails
        isOpen={isOpen}
        onClose={onClose}
        appointmentDetails={selectedAppointment}
        handleJoin={handleJoin}
      />
    </>
  );
}

export default Page;