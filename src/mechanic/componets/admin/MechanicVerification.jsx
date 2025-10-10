import React, { useEffect, useState } from "react";
import api from "@/utils/api";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Button,
} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Kbd } from "@/components/ui/kbd";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TriangleAlert, Search, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"



const ITEMS_PER_PAGE = 5;

export default function MechanicVerification() {
  const [mechanics, setMechanics] = useState([]);
  const [selectedMechanic, setSelectedMechanic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);


  const fetchMechanicDetails = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await api.get("users/GetMechanicDetailForVerify");
      setMechanics(res.data);
    } catch (error) {
      const msg = error.response?.data?.detail || "Something went wrong.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedMechanic || !isDialogOpen) return;

      if (e.key === "Escape") {
        rejectMechanic(selectedMechanic.id);
      } else if (e.key === "Enter") {
        verifyMechanic(selectedMechanic.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMechanic, isDialogOpen]);


  useEffect(() => {
    fetchMechanicDetails();
  }, []);

  const verifyMechanic = async (mechanic_id) => {
    setIsVerifying(true);
    try {
      await api.post("users/VerifyMechanic/", { mechanic_id });
      toast({ title: "Mechanic Approved ✅" });
      setIsDialogOpen(false);
      setSelectedMechanic(null);
      fetchMechanicDetails();
    } catch (error) {
      const msg = error.response?.data?.detail || "Failed to verify mechanic.";
      setErrorMsg(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const rejectMechanic = async (mechanic_id) => {
    setIsRejecting(true);
    try {
      await api.post("users/RejectMechanic/", { mechanic_id });
      toast({ title: "Mechanic Rejected ❌" });
      setIsDialogOpen(false);
      setSelectedMechanic(null);
      fetchMechanicDetails();
    } catch (error) {
      const msg = error.response?.data?.detail || "Failed to reject mechanic.";
      setErrorMsg(msg);
    } finally {
      setIsRejecting(false);
    }
  };


  const filteredMechanics = mechanics.filter((m) =>
    m.user?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.user?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.user?.mobile_number?.includes(search) ||
    m.shop_name?.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedMechanics = filteredMechanics.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {errorMsg && (
        <Alert variant="destructive" className="max-w-lg">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Mechanic Verification
        </h1>
        <p className="text-muted-foreground">
          Review, verify, or reject mechanics pending approval.
        </p>
      </div>

      <div className="flex items-center gap-2 max-w-md mx-auto">
        <Search className="w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search by name, shop, or mobile..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // reset pagination on new search
          }}
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          ))}
        </div>
      ) : filteredMechanics.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
          </EmptyHeader>
          <EmptyTitle>No mechanics mechanics</EmptyTitle>
        </Empty>
      ) : (
        <>
          <div className="border rounded-lg shadow-sm p-4 bg-white dark:bg-muted">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Shop</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMechanics.map((mechanic) => (
                  <TableRow key={mechanic.id}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={mechanic.user?.profile_pic} />
                        <AvatarFallback>
                          {mechanic.user?.first_name?.[0] ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>{mechanic.user?.first_name} {mechanic.user?.last_name}</TableCell>
                    <TableCell>{mechanic.user?.mobile_number}</TableCell>
                    <TableCell>{mechanic.shop_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Pending</Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) setSelectedMechanic(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" onClick={() => setSelectedMechanic(mechanic)}>
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl overflow-y-auto max-h-screen">
                          <DialogHeader>
                            <DialogTitle>Mechanic Details</DialogTitle>
                          </DialogHeader>
                          {selectedMechanic && (
                            <div className="space-y-4">
                              <div className="flex justify-center">
                                <Avatar className="w-24 h-24">
                                  <AvatarImage src={selectedMechanic.user?.profile_pic} />
                                  <AvatarFallback>
                                    {selectedMechanic.user?.first_name?.[0] ?? "?"}
                                  </AvatarFallback>
                                </Avatar>
                              </div>

                              <Separator />

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>First Name</Label>
                                  <Input value={selectedMechanic.user?.first_name || ""} disabled />
                                </div>
                                <div>
                                  <Label>Last Name</Label>
                                  <Input value={selectedMechanic.user?.last_name || ""} disabled />
                                </div>
                                <div>
                                  <Label>Email</Label>
                                  <Input value={selectedMechanic.user?.email || ""} disabled />
                                </div>
                                <div>
                                  <Label>Mobile Number</Label>
                                  <Input value={selectedMechanic.user?.mobile_number || ""} disabled />
                                </div>
                                <div>
                                  <Label>Aadhar Card</Label>
                                  <Input value={selectedMechanic.adhar_card || "N/A"} disabled />
                                </div>
                                <div>
                                  <Label>Shop Name</Label>
                                  <Input value={selectedMechanic.shop_name || ""} disabled />
                                </div>
                                <div className="col-span-2">
                                  <Label>KYC Document LINK</Label>
                                  <Input value={selectedMechanic.KYC_document || ""} disabled />
                                </div>
                                <div className="col-span-2">
                                  <Label>Shop Address</Label>
                                  <Input value={selectedMechanic.shop_address || ""} disabled />
                                </div>
                                <div className="col-span-2">
                                  <Label>Shop Location (Lat, Long)</Label>
                                  <Input
                                    value={`${selectedMechanic.shop_latitude ?? ""}, ${selectedMechanic.shop_longitude ?? ""}`}
                                    disabled
                                  />
                                </div>
                              </div>

                              {selectedMechanic.KYC_document && (
                                <div className="space-y-2">
                                  <Label>KYC Document</Label>
                                  <div className="border rounded-md overflow-hidden h-[400px]">
                                    <iframe
                                      src={selectedMechanic.KYC_document}
                                      title="KYC Document"
                                      width="100%"
                                      height="100%"
                                      className="rounded"
                                    />
                                  </div>
                                </div>
                              )}

                              <div className="flex justify-between mt-6">
                                <Button
                                  variant="destructive"
                                  onClick={() => rejectMechanic(selectedMechanic.id)}
                                  disabled={isRejecting}
                                >
                                  {isRejecting ? "Rejecting..." : <>Reject <Kbd className="text-red-500 font-bold">Esc</Kbd></>}
                                </Button>

                                <Button
                                  onClick={() => verifyMechanic(selectedMechanic.id)}
                                  disabled={isVerifying}
                                >
                                  {isVerifying ? "Approving..." : <>Approve <Kbd className="text-black font-bold">Enter</Kbd></>}
                                </Button>

                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-center gap-2 mt-6">
            <Button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              variant="outline"
            >
              Previous
            </Button>
            <Button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * ITEMS_PER_PAGE >= filteredMechanics.length}
              variant="outline"
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
