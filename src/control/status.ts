/* Copyright (C) [2003] - [2016] RealEyes Media, LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by RealEyes Media, October 2016
 *
 * THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND,
 * EITHER EXPRESSED OR IMPLIED,  INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND/OR FITNESS FOR A PARTICULAR PURPOSE.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of RealEyes Media, LLC and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to RealEyes Media, LLC
 * and its suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from RealEyes Media, LLC.
 */

interface StatusObject {
    [inputURI: string]: Status
}

interface Status {
    status: string | string []
    complete?: boolean
    error?: boolean
}

export const statusObject = {} as StatusObject

export async function updateStatusObject(inputURI: string, status: string | string[], complete?: boolean, error?: boolean) {
    if (!exports.statusObject[inputURI]) {
        statusObject[inputURI] = {} as Status
    }

    statusObject[inputURI].status = status
    if (complete) {
        statusObject[inputURI].complete = true
    }
    if (error) {
        statusObject[inputURI].error = true
    }
}