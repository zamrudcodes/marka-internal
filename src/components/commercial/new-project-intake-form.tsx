"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const formSchema = z.object({
    // Section 1: The Strategy
    avatar: z.string().min(1, "The Avatar is required"),
    trigger: z.string().min(1, "The Trigger is required"),
    visual_proof: z.string().min(1, "The Visual Proof is required"),
    one_feature: z.string().min(1, "The One Feature is required"),
    ah_ha_moment: z.string().optional(),

    // Section 2: The Offer
    offer: z.string().min(1, "The Offer is required"),
    scarcity: z.string().optional(),
    cta: z.string().min(1, "The CTA is required"),

    // Section 3: The Assets
    product_link: z.string().url("Must be a valid URL"),
    asset_library: z.string().url("Must be a valid URL"),
    dos_and_donts: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function NewProjectIntakeForm() {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            avatar: "",
            trigger: "",
            visual_proof: "",
            one_feature: "",
            ah_ha_moment: "",
            offer: "",
            scarcity: "",
            cta: "",
            product_link: "",
            asset_library: "",
            dos_and_donts: "",
        },
    });

    function onSubmit(values: FormValues) {
        // For now, just log to console and show toast
        console.log(values);
        toast.success("Project intake form submitted successfully (Console Log only for now)");
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto py-10">

                {/* Section 1: The Strategy */}
                <Card>
                    <CardHeader>
                        <CardTitle>Section 1: The Strategy</CardTitle>
                        <CardDescription>Raw Material for the Strategist - Give them the ammunition to write the hook and sales argument.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <FormField
                            control={form.control}
                            name="avatar"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>The Avatar <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Describe the specific person we are targeting (e.g., 'Overwhelmed moms with toddlers')." {...field} />
                                    </FormControl>
                                    <FormDescription>Targeting. You cannot write a specific hook for a general audience.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="trigger"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>The Trigger <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="What is the specific annoying problem or moment that makes them realize they need this?" {...field} />
                                    </FormControl>
                                    <FormDescription>Agitation. This fuels the 'Hook' script. We need a pain point to agitate.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="visual_proof"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>The Visual Proof <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="What does the result look like? (e.g., 'Dirty sink becomes white')" {...field} />
                                    </FormControl>
                                    <FormDescription>Demonstration. TikTok is visual. We need to know what to show, not just say.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="one_feature"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>The One Feature <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="If you could only mention ONE feature, what is it?" {...field} />
                                    </FormControl>
                                    <FormDescription>Focus. A 30s video cannot sell 5 features.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="ah_ha_moment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>The 'Ah-Ha' Moment</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="What is the biggest misconception people have about this product category?" {...field} />
                                    </FormControl>
                                    <FormDescription>Pattern Interrupt. Allows the Strategist to write a 'contrarian' hook.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Section 2: The Offer */}
                <Card>
                    <CardHeader>
                        <CardTitle>Section 2: The Offer</CardTitle>
                        <CardDescription>Raw Material for the Close - Specific instructions for the Call to Action (CTA).</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <FormField
                            control={form.control}
                            name="offer"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>The Offer <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="What is the deal? (e.g., 'Buy one get one', '20% off')" {...field} />
                                    </FormControl>
                                    <FormDescription>Incentive. 'Inspiration to buy' usually requires a friction reducer.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="scarcity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>The Scarcity</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Is there a limit? (e.g., '24 hours only', 'While supplies last')" {...field} />
                                    </FormControl>
                                    <FormDescription>Urgency. Drives the click-through rate (CTR).</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="cta"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>The CTA <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="What is the exact verbal instruction? (e.g., 'Link in bio', 'Shop Now')" {...field} />
                                    </FormControl>
                                    <FormDescription>Clarity. The Editor needs to know exactly what text to put on the final screen.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Section 3: The Assets */}
                <Card>
                    <CardHeader>
                        <CardTitle>Section 3: The Assets</CardTitle>
                        <CardDescription>Raw Material for the Editor - Ensure physical files are available.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <FormField
                            control={form.control}
                            name="product_link"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product Link <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://..." {...field} />
                                    </FormControl>
                                    <FormDescription>Context. Allows Strategist to verify claims and Editor to see the landing page vibe.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="asset_library"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Asset Library <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Google Drive/Dropbox link..." {...field} />
                                    </FormControl>
                                    <FormDescription>Inventory. Link to raw footage/photos.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="dos_and_donts"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Do’s & Don’ts</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Are there specific words we cannot say? (e.g., Compliance issues)" {...field} />
                                    </FormControl>
                                    <FormDescription>Compliance. Prevents expensive rework due to legal/brand violations.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Button type="submit" className="w-full">Submit Project Intake</Button>
            </form>
        </Form>
    );
}
